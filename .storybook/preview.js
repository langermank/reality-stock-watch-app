import "../app/styles/reset.css";
import "../app/styles/global.css";
import "../app/styles/radix-light.css";
import "../app/styles/radix-dark.css";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Switch themes",
    defaultValue: "light",
    toolbar: {
      icon: "circlehollow",
      items: ["light", "dark", "all"],
      showName: false,
    },
  },
};

export const decorators = [
  (Story, context) => {
    if (context.globals.theme === "all") {
      return (
        <div class="theme-wrap">
          <div className="dark-theme">
            <Story {...context} />
          </div>

          <div className="light-theme">
            <Story {...context} />
          </div>
        </div>
      );
    }

    if (context.globals.theme === "dark") {
      return (
        <div className="dark-theme">
          <Story {...context} />
        </div>
      );
    }

    return (
      <div className="light-theme">
        <Story {...context} />
      </div>
    );
  },
];
