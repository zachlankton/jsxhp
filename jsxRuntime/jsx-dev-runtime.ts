function Fragment() {}

interface Source {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
}

// Symbol to identify our JSX elements
const JSX_ELEMENT = Symbol.for("jsx.element");

function jsx(
  type: JSX.ElementType,
  props: any,
  key: string | number | null,
  isStaticChildren: boolean,
  source: Source | undefined,
  self: any
): JSX.Element {
  const element: JSX.Element = {
    type,
    props: props || {},
    key,
    isStaticChildren,
    $$typeof: JSX_ELEMENT,
    _owner: self,
  };

  return element;
}

async function renderToHTML(
  elm: JSX.Element,
  controller: ReadableStreamDefaultController
) {
  let promises: Promise<void>[] = [];
  await walkJSXElement(elm, controller);
  while (promises.length > 0) {
    const promiseStash = [...promises];
    await Promise.allSettled(promiseStash);
    promises = promises.filter((promise) => !promiseStash.includes(promise));
  }

  async function walkJSXElement(
    element: JSX.Element,
    controller: ReadableStreamDefaultController
  ): Promise<void> {
    // If the element type is a function, call it to get the rendered element
    if (
      typeof element.type === "function" &&
      element.type.name !== "Fragment"
    ) {
      const renderedElement = element.type(element.props) as JSX.Element;
      if (renderedElement instanceof Promise) {
        let resolveProm: () => void;
        const prom = new Promise<void>((resolve) => {
          resolveProm = resolve;
        });
        promises.push(prom);
        const uniqueId = Math.random().toString(36).substring(2, 15);
        const fallback: JSX.Element =
          element.type.LoaderFallback ??
          jsxDEV(
            "div",
            { children: "Loading... (Default Fallback)" },
            null,
            true,
            undefined,
            undefined
          );

        fallback.props.id = uniqueId;

        await walkJSXElement(fallback, controller);
        renderedElement.then(async (resolvedElement) => {
          if (
            resolvedElement.type.name === "Fragment" &&
            resolvedElement.props.children &&
            Array.isArray(resolvedElement.props.children)
          ) {
            resolvedElement.props.children.forEach((child: JSX.Element) => {
              if (child && typeof child === "object" && "props" in child) {
                child.props.style += ";display: none;";
                child.props.dataLoaderId = uniqueId;
              }
            });
          } else {
            resolvedElement.props.style += ";display: none;";
            resolvedElement.props.dataLoaderId = uniqueId;
          }

          await walkJSXElement(resolvedElement, controller);
          controller.enqueue(`
        <script>
          (() => {
            const loader = document.getElementById("${uniqueId}");
            const thisElement = document.querySelectorAll('[data-loader-id="${uniqueId}"]');
            thisElement.forEach((element) => {
              element.style.display = "";
              element.removeAttribute("data-loader-id");
              loader.parentNode.insertBefore(element, loader);
            });
            loader.remove();
            document.currentScript.remove();
          })()  
        </script>
        `);
          resolveProm();
        });
      } else {
        await walkJSXElement(renderedElement, controller);
      }
      return;
    }

    const [openingTag, closingTag] = getElementTags(element);
    controller.enqueue(openingTag);

    // Recursively walk through children
    if (Array.isArray(element.props.children)) {
      const childPromises = [];
      for (const child of element.props.children) {
        if (
          child &&
          typeof child === "object" &&
          "type" in child &&
          typeof child.type === "function" &&
          child.type.name !== "Fragment"
        ) {
          childPromises.push(walkJSXElement(child as JSX.Element, controller));
        } else if (
          child &&
          typeof child === "object" &&
          "$$typeof" in child &&
          child.$$typeof === JSX_ELEMENT
        ) {
          await walkJSXElement(child as JSX.Element, controller);
        } else if (child && typeof child === "string") {
          controller.enqueue(child + "\n");
        } else if (Array.isArray(child)) {
          child.forEach((c) => {
            if (
              c &&
              typeof c === "object" &&
              "$$typeof" in c &&
              c.$$typeof === JSX_ELEMENT
            ) {
              walkJSXElement(c as JSX.Element, controller);
            }
          });
        }
      }
      if (childPromises.length > 0) {
        await Promise.allSettled(childPromises);
      }
    } else if (
      element.props.children &&
      typeof element.props.children === "object" &&
      (element.props.children as JSX.Element).$$typeof === JSX_ELEMENT
    ) {
      await walkJSXElement(element.props.children as JSX.Element, controller);
    } else if (
      element.props.children &&
      typeof element.props.children === "string"
    ) {
      controller.enqueue(element.props.children);
    }

    try {
      controller.enqueue(closingTag);
    } catch (error) {
      debugger;
    }
  }
}

function getElementTags(element: JSX.Element): [string, string] {
  // check if element type is a function
  if (typeof element.type === "function") {
    return ["", ""];
  }

  const attributes = Object.entries(element.props)
    .filter(([key, value]) => value !== undefined && key !== "children")
    .map(([key, value]) => {
      if (key === "style" && typeof value === "object" && value !== null) {
        const styleString = Object.entries(value as any)
          .map(
            ([cssKey, cssValue]) =>
              `${convertKeyToAttribute(cssKey)}: ${cssValue}`
          )
          .join("; ");
        return `style="${styleString}"`;
      }
      return `${convertKeyToAttribute(key)}="${value}"`;
    })
    .join(" ");

  return [`<${element.type} ${attributes}>\n`, `</${element.type}>\n`];
}

function convertKeyToAttribute(key: string): string {
  // convert camelCase to dash-case
  return key.replace(/([A-Z])/g, "-$1").toLowerCase();
}

const jsxDEV = jsx;

export { jsx, jsxDEV, renderToHTML, Fragment };
