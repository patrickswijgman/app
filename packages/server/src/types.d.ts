type Settings = {
  server: {
    host: string;
    port: number;
  };
};

type Content = {
  content: string;
  type: "html" | "css" | "json" | string;
};

type Templates = Record<string, string>;

type Config = {
  settings?: Partial<Settings>;
  templates?: Templates;
  routes: Record<string, () => Content>;
};

type Obj = Record<string, any>;
