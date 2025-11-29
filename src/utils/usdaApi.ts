const USDA_API_KEY = "oGLHC6HtxsiEwd5FDVbn4ZAoaxkLDzKdi427xcfX";
const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

export interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  foodCategory?: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
  }>;
}

export interface USDASearchResult {
  foods: USDAFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

// Nutrient IDs from USDA database
const NUTRIENT_IDS = {
  // Essential amino acids (mg)
  histidine: 1221,
  isoleucine: 1212,
  leucine: 1213,
  lysine: 1214,
  methionine: 1215,
  phenylalanine: 1217,
  threonine: 1211,
  tryptophan: 1210,
  valine: 1219,
  // Other nutrients
  energy: 1008, // kcal
  protein: 1003, // g
  carbs: 1005, // g
  fat: 1004, // g
  fiber: 1079, // g
  calcium: 1087, // mg
  iron: 1089, // mg
  vitaminC: 1162, // mg
};

export async function searchUSDAFoods(
  query: string,
  pageSize: number = 25
): Promise<USDASearchResult> {
  const url = `${USDA_BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(
    query
  )}&pageSize=${pageSize}&dataType=Foundation,SR%20Legacy`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }
    const data = await response.json();
    return {
      foods: data.foods || [],
      totalHits: data.totalHits || 0,
      currentPage: data.currentPage || 1,
      totalPages: data.totalPages || 1,
    };
  } catch (error) {
    console.error("Error fetching USDA data:", error);
    throw error;
  }
}

export async function getUSDAFoodDetails(fdcId: number): Promise<USDAFood> {
  const url = `${USDA_BASE_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching USDA food details:", error);
    throw error;
  }
}

export function parseUSDAFoodToNutrition(usdaFood: USDAFood) {
  const getNutrient = (nutrientId: number): number => {
    const nutrient = usdaFood.foodNutrients.find((n) => n.nutrientId === nutrientId);
    return nutrient?.value || 0;
  };

  // Convert amino acids from g to mg (USDA reports in grams)
  const getAminoAcid = (nutrientId: number): number => {
    const value = getNutrient(nutrientId);
    return value * 1000; // Convert g to mg
  };

  // Estimate cost based on food type (since USDA doesn't provide pricing)
  // This is a rough estimate - could be improved with a separate pricing database
  const estimatedCostPer100g = estimateFoodCost(usdaFood.description, usdaFood.foodCategory);

  return {
    id: `usda_${usdaFood.fdcId}`,
    name: usdaFood.description,
    category: usdaFood.foodCategory || "Other",
    cost: estimatedCostPer100g,
    // Essential amino acids (mg per 100g)
    histidine: getAminoAcid(NUTRIENT_IDS.histidine),
    isoleucine: getAminoAcid(NUTRIENT_IDS.isoleucine),
    leucine: getAminoAcid(NUTRIENT_IDS.leucine),
    lysine: getAminoAcid(NUTRIENT_IDS.lysine),
    methionine: getAminoAcid(NUTRIENT_IDS.methionine),
    phenylalanine: getAminoAcid(NUTRIENT_IDS.phenylalanine),
    threonine: getAminoAcid(NUTRIENT_IDS.threonine),
    tryptophan: getAminoAcid(NUTRIENT_IDS.tryptophan),
    valine: getAminoAcid(NUTRIENT_IDS.valine),
    // Other nutrients (for display)
    energy: getNutrient(NUTRIENT_IDS.energy),
    protein: getNutrient(NUTRIENT_IDS.protein),
    carbs: getNutrient(NUTRIENT_IDS.carbs),
    fat: getNutrient(NUTRIENT_IDS.fat),
    fiber: getNutrient(NUTRIENT_IDS.fiber),
    calcium: getNutrient(NUTRIENT_IDS.calcium),
    iron: getNutrient(NUTRIENT_IDS.iron),
    vitaminC: getNutrient(NUTRIENT_IDS.vitaminC),
  };
}

// Simple cost estimation logic
function estimateFoodCost(description: string, category?: string): number {
  const desc = description.toLowerCase();
  
  // Meat and protein
  if (desc.includes("beef") || desc.includes("steak")) return 1.2;
  if (desc.includes("chicken") || desc.includes("turkey")) return 0.8;
  if (desc.includes("pork")) return 0.9;
  if (desc.includes("fish") || desc.includes("salmon")) return 1.5;
  if (desc.includes("shrimp")) return 2.0;
  
  // Dairy
  if (desc.includes("cheese")) return 0.6;
  if (desc.includes("milk")) return 0.08;
  if (desc.includes("yogurt")) return 0.3;
  if (desc.includes("egg")) return 0.35;
  
  // Grains
  if (desc.includes("rice")) return 0.15;
  if (desc.includes("bread")) return 0.25;
  if (desc.includes("pasta")) return 0.20;
  if (desc.includes("oat")) return 0.18;
  
  // Vegetables
  if (desc.includes("potato")) return 0.12;
  if (desc.includes("carrot")) return 0.15;
  if (desc.includes("broccoli")) return 0.25;
  if (desc.includes("spinach")) return 0.30;
  if (desc.includes("lettuce")) return 0.20;
  
  // Fruits
  if (desc.includes("apple")) return 0.25;
  if (desc.includes("banana")) return 0.18;
  if (desc.includes("orange")) return 0.22;
  if (desc.includes("berry") || desc.includes("berries")) return 0.50;
  
  // Legumes and nuts
  if (desc.includes("bean")) return 0.25;
  if (desc.includes("lentil")) return 0.22;
  if (desc.includes("peanut")) return 0.45;
  if (desc.includes("almond") || desc.includes("walnut")) return 0.80;
  
  // Default by category
  if (category?.toLowerCase().includes("vegetable")) return 0.20;
  if (category?.toLowerCase().includes("fruit")) return 0.25;
  if (category?.toLowerCase().includes("protein")) return 0.90;
  
  return 0.30; // Default estimate
}
