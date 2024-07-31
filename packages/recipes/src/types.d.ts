type Recipe = {
  id: string;
  name: string;
  persons: number;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit?: "g" | "ml";
  }>;
};
