import solver from "javascript-lp-solver";
import { USDA_FOODS, WHO_CONSTRAINTS, type Food } from "./nutritionData";

export interface OptimizationResult {
  foods: Array<{
    food: Food;
    amount: number; // in grams
  }>;
  totalCost: number;
  nutrients: {
    energy: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    calcium: number;
    iron: number;
    vitaminC: number;
  };
  feasible: boolean;
}

export function solveNutritionOptimization(): OptimizationResult {
  // Build the LP model
  const model: any = {
    optimize: "cost",
    opType: "min",
    constraints: {},
    variables: {},
  };

  // Add constraints for each nutrient
  model.constraints.energy_min = { min: WHO_CONSTRAINTS.energy.min };
  model.constraints.energy_max = { max: WHO_CONSTRAINTS.energy.max };
  model.constraints.protein = { min: WHO_CONSTRAINTS.protein.min };
  model.constraints.carbs = { min: WHO_CONSTRAINTS.carbs.min };
  model.constraints.fat = { min: WHO_CONSTRAINTS.fat.min };
  model.constraints.fiber = { min: WHO_CONSTRAINTS.fiber.min };
  model.constraints.calcium = { min: WHO_CONSTRAINTS.calcium.min };
  model.constraints.iron = { min: WHO_CONSTRAINTS.iron.min };
  model.constraints.vitaminC = { min: WHO_CONSTRAINTS.vitaminC.min };

  // Add variables for each food (in 100g units)
  USDA_FOODS.forEach((food) => {
    model.variables[food.id] = {
      cost: food.cost,
      energy_min: food.energy,
      energy_max: food.energy,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      calcium: food.calcium,
      iron: food.iron,
      vitaminC: food.vitaminC,
    };
  });

  // Solve the LP problem
  const solution = solver.Solve(model);

  // Parse results
  const foods: Array<{ food: Food; amount: number }> = [];
  let totalCost = 0;
  const nutrients = {
    energy: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    calcium: 0,
    iron: 0,
    vitaminC: 0,
  };

  if (solution.feasible) {
    USDA_FOODS.forEach((food) => {
      const amount = solution[food.id] || 0;
      if (amount > 0.01) {
        // Only include foods with meaningful amounts
        const amountInGrams = amount * 100; // Convert from 100g units to grams
        foods.push({ food, amount: amountInGrams });
        totalCost += food.cost * amount;

        // Calculate total nutrients
        nutrients.energy += food.energy * amount;
        nutrients.protein += food.protein * amount;
        nutrients.carbs += food.carbs * amount;
        nutrients.fat += food.fat * amount;
        nutrients.fiber += food.fiber * amount;
        nutrients.calcium += food.calcium * amount;
        nutrients.iron += food.iron * amount;
        nutrients.vitaminC += food.vitaminC * amount;
      }
    });
  }

  return {
    foods: foods.sort((a, b) => b.amount - a.amount),
    totalCost: Number(totalCost.toFixed(2)),
    nutrients: {
      energy: Number(nutrients.energy.toFixed(1)),
      protein: Number(nutrients.protein.toFixed(1)),
      carbs: Number(nutrients.carbs.toFixed(1)),
      fat: Number(nutrients.fat.toFixed(1)),
      fiber: Number(nutrients.fiber.toFixed(1)),
      calcium: Number(nutrients.calcium.toFixed(1)),
      iron: Number(nutrients.iron.toFixed(1)),
      vitaminC: Number(nutrients.vitaminC.toFixed(1)),
    },
    feasible: solution.feasible,
  };
}
