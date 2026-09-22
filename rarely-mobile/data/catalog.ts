export type Product = {
  id: string;
  title: string;
  brand: string;
  price: number;
  category: string;
  tags: string[];
  availability: "in-stock" | "low-stock";
  imageUrl: string;
  merchantUrl: string;
};

const mockImage = "mock://serpapi/catalog";

export const DEMO_PRODUCTS: Product[] = [
  { id: "p-001", title: "Soft Structure Tote", brand: "Northline", price: 78, category: "bags", tags: ["minimal", "neutral", "everyday", "polished"], availability: "in-stock", imageUrl: mockImage, merchantUrl: "mock://merchant/northline" },
  { id: "p-002", title: "Cloud Knit Layer", brand: "Morrow", price: 64, category: "layers", tags: ["minimal", "comfortable", "neutral", "casual"], availability: "in-stock", imageUrl: mockImage, merchantUrl: "mock://merchant/morrow" },
  { id: "p-003", title: "Everyday Rib Tee", brand: "Common Thread", price: 32, category: "tops", tags: ["everyday", "comfortable", "casual", "neutral"], availability: "in-stock", imageUrl: mockImage, merchantUrl: "mock://merchant/common-thread" },
  { id: "p-004", title: "Tapered Studio Trouser", brand: "Frame & Form", price: 96, category: "bottoms", tags: ["polished", "minimal", "studio", "neutral"], availability: "low-stock", imageUrl: mockImage, merchantUrl: "mock://merchant/frame-form" },
  { id: "p-005", title: "Quiet Leather Loafer", brand: "Stillwell", price: 118, category: "shoes", tags: ["polished", "minimal", "everyday", "neutral"], availability: "in-stock", imageUrl: mockImage, merchantUrl: "mock://merchant/stillwell" },
  { id: "p-006", title: "Canvas Weekend Cap", brand: "Daymark", price: 28, category: "accessories", tags: ["casual", "everyday", "comfortable"], availability: "in-stock", imageUrl: mockImage, merchantUrl: "mock://merchant/daymark" },
  { id: "p-007", title: "Brushed Metal Cuff", brand: "Arc Objects", price: 42, category: "accessories", tags: ["minimal", "polished", "neutral"], availability: "in-stock", imageUrl: mockImage, merchantUrl: "mock://merchant/arc-objects" },
  { id: "p-008", title: "Linen Day Dress", brand: "Kindred", price: 88, category: "dresses", tags: ["everyday", "comfortable", "neutral", "polished"], availability: "low-stock", imageUrl: mockImage, merchantUrl: "mock://merchant/kindred" },
  { id: "p-009", title: "Relaxed Cotton Overshirt", brand: "Morrow", price: 72, category: "layers", tags: ["casual", "comfortable", "everyday", "minimal"], availability: "in-stock", imageUrl: mockImage, merchantUrl: "mock://merchant/morrow" },
  { id: "p-010", title: "Compact Crossbody", brand: "Northline", price: 54, category: "bags", tags: ["casual", "minimal", "everyday"], availability: "in-stock", imageUrl: mockImage, merchantUrl: "mock://merchant/northline" },
  { id: "p-011", title: "Satin Evening Shell", brand: "Frame & Form", price: 108, category: "tops", tags: ["polished", "occasion", "neutral"], availability: "low-stock", imageUrl: mockImage, merchantUrl: "mock://merchant/frame-form" },
  { id: "p-012", title: "Everyday Recycled Sneaker", brand: "Open Step", price: 82, category: "shoes", tags: ["casual", "comfortable", "everyday", "neutral"], availability: "in-stock", imageUrl: mockImage, merchantUrl: "mock://merchant/open-step" },
];

export function filterDemoProducts(products: Product[], query: string, budget: { min: number; max: number }): Product[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return products.filter((product) => product.price >= budget.min && product.price <= budget.max && terms.some((term) => product.tags.includes(term) || product.category.includes(term) || product.title.toLowerCase().includes(term)));
}
