import solver from "javascript-lp-solver";
import { USDA_FOODS, WHO_CONSTRAINTS, type Food } from "./nutritionData";

export interface OptimizationResult {
  foods: Array<{
    food: Food;
    amount: number; // in grams
  }>;
  totalCost: number;
  nutrients: {
    histidine: number;
    isoleucine: number;
    leucine: number;
    lysine: number;
    methionine: number;
    phenylalanine: number;
    threonine: number;
    tryptophan: number;
    valine: number;
    // Additional info
    energy?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  feasible: boolean;
}

export function solveNutritionOptimization(foodDatabase: Food[] = USDA_FOODS): OptimizationResult {
  // Build the LP model
  const model: any = {
    optimize: "cost",
    opType: "min",
    constraints: {},
    variables: {},
  };

  // Add constraints for essential amino acids
  model.constraints.histidine_min = { min: WHO_CONSTRAINTS.histidine.min };
  model.constraints.histidine_max = { max: WHO_CONSTRAINTS.histidine.max };
  model.constraints.isoleucine_min = { min: WHO_CONSTRAINTS.isoleucine.min };
  model.constraints.isoleucine_max = { max: WHO_CONSTRAINTS.isoleucine.max };
  model.constraints.leucine_min = { min: WHO_CONSTRAINTS.leucine.min };
  model.constraints.leucine_max = { max: WHO_CONSTRAINTS.leucine.max };
  model.constraints.lysine_min = { min: WHO_CONSTRAINTS.lysine.min };
  model.constraints.lysine_max = { max: WHO_CONSTRAINTS.lysine.max };
  model.constraints.methionine_min = { min: WHO_CONSTRAINTS.methionine.min };
  model.constraints.methionine_max = { max: WHO_CONSTRAINTS.methionine.max };
  model.constraints.phenylalanine_min = { min: WHO_CONSTRAINTS.phenylalanine.min };
  model.constraints.phenylalanine_max = { max: WHO_CONSTRAINTS.phenylalanine.max };
  model.constraints.threonine_min = { min: WHO_CONSTRAINTS.threonine.min };
  model.constraints.threonine_max = { max: WHO_CONSTRAINTS.threonine.max };
  model.constraints.tryptophan_min = { min: WHO_CONSTRAINTS.tryptophan.min };
  model.constraints.tryptophan_max = { max: WHO_CONSTRAINTS.tryptophan.max };
  model.constraints.valine_min = { min: WHO_CONSTRAINTS.valine.min };
  model.constraints.valine_max = { max: WHO_CONSTRAINTS.valine.max };

  // Add variables for each food (in 100g units)
  foodDatabase.forEach((food) => {
    model.variables[food.id] = {
      cost: food.cost,
      histidine_min: food.histidine,
      histidine_max: food.histidine,
      isoleucine_min: food.isoleucine,
      isoleucine_max: food.isoleucine,
      leucine_min: food.leucine,
      leucine_max: food.leucine,
      lysine_min: food.lysine,
      lysine_max: food.lysine,
      methionine_min: food.methionine,
      methionine_max: food.methionine,
      phenylalanine_min: food.phenylalanine,
      phenylalanine_max: food.phenylalanine,
      threonine_min: food.threonine,
      threonine_max: food.threonine,
      tryptophan_min: food.tryptophan,
      tryptophan_max: food.tryptophan,
      valine_min: food.valine,
      valine_max: food.valine,
    };
  });

  // Solve the LP problem
  const solution = solver.Solve(model);

  // Parse results
  const foods: Array<{ food: Food; amount: number }> = [];
  let totalCost = 0;
  const nutrients = {
    histidine: 0,
    isoleucine: 0,
    leucine: 0,
    lysine: 0,
    methionine: 0,
    phenylalanine: 0,
    threonine: 0,
    tryptophan: 0,
    valine: 0,
    energy: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  if (solution.feasible) {
    foodDatabase.forEach((food) => {
      const amount = solution[food.id] || 0;
      if (amount > 0.01) {
        // Only include foods with meaningful amounts
        const amountInGrams = amount * 100; // Convert from 100g units to grams
        foods.push({ food, amount: amountInGrams });
        totalCost += food.cost * amount;

        // Calculate total amino acids
        nutrients.histidine += food.histidine * amount;
        nutrients.isoleucine += food.isoleucine * amount;
        nutrients.leucine += food.leucine * amount;
        nutrients.lysine += food.lysine * amount;
        nutrients.methionine += food.methionine * amount;
        nutrients.phenylalanine += food.phenylalanine * amount;
        nutrients.threonine += food.threonine * amount;
        nutrients.tryptophan += food.tryptophan * amount;
        nutrients.valine += food.valine * amount;
        
        // Calculate other nutrients (for display)
        nutrients.energy += (food.energy || 0) * amount;
        nutrients.protein += (food.protein || 0) * amount;
        nutrients.carbs += (food.carbs || 0) * amount;
        nutrients.fat += (food.fat || 0) * amount;
      }
    });
  }

  return {
    foods: foods.sort((a, b) => b.amount - a.amount),
    totalCost: Number(totalCost.toFixed(2)),
    nutrients: {
      histidine: Number(nutrients.histidine.toFixed(1)),
      isoleucine: Number(nutrients.isoleucine.toFixed(1)),
      leucine: Number(nutrients.leucine.toFixed(1)),
      lysine: Number(nutrients.lysine.toFixed(1)),
      methionine: Number(nutrients.methionine.toFixed(1)),
      phenylalanine: Number(nutrients.phenylalanine.toFixed(1)),
      threonine: Number(nutrients.threonine.toFixed(1)),
      tryptophan: Number(nutrients.tryptophan.toFixed(1)),
      valine: Number(nutrients.valine.toFixed(1)),
      energy: Number(nutrients.energy.toFixed(1)),
      protein: Number(nutrients.protein.toFixed(1)),
      carbs: Number(nutrients.carbs.toFixed(1)),
      fat: Number(nutrients.fat.toFixed(1)),
    },
    feasible: solution.feasible,
  };
}
