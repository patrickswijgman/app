type Settings = {
  host: string;
  port: number;
};

type Content = {
  content: string;
  type: string;
};

type Templates = Record<string, string>;

type Config = {
  settings?: Partial<Settings>;
  templates?: Templates;
  routes: Record<string, () => Content>;
};

type Dict = Record<string, any>;
