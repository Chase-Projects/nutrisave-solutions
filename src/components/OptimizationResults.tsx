import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WHO_CONSTRAINTS } from "@/utils/nutritionData";
import type { OptimizationResult } from "@/utils/lpSolver";
import { DollarSign, Apple, Activity } from "lucide-react";

interface OptimizationResultsProps {
  result: OptimizationResult;
}

export const OptimizationResults = ({ result }: OptimizationResultsProps) => {
  // Calculate percentage of daily value (based on minimum requirement)
  const getDailyValuePercent = (nutrient: keyof typeof WHO_CONSTRAINTS) => {
    const value = result.nutrients[nutrient];
    const constraint = WHO_CONSTRAINTS[nutrient];
    return (value / constraint.min) * 100;
  };

  const isNutrientMet = (nutrient: keyof typeof WHO_CONSTRAINTS) => {
    const value = result.nutrients[nutrient];
    const constraint = WHO_CONSTRAINTS[nutrient];
    return value >= constraint.min && value <= constraint.max;
  };

  // Find the maximum daily value percentage for normalizing progress bars
  const maxDailyValuePercent = Math.max(
    ...Object.keys(WHO_CONSTRAINTS).map((nutrient) =>
      getDailyValuePercent(nutrient as keyof typeof WHO_CONSTRAINTS)
    )
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-700">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 gradient-card shadow-custom-lg border-primary/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Daily Cost</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">${result.totalCost}</p>
          <p className="text-xs text-muted-foreground mt-1">Optimized for minimum cost</p>
        </Card>

        <Card className="p-6 gradient-card shadow-custom-lg border-success/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-success/10">
              <Activity className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Protein</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{result.nutrients.protein?.toFixed(1) || 0}g</p>
          <p className="text-xs text-muted-foreground mt-1">Total protein</p>
        </Card>

        <Card className="p-6 gradient-card shadow-custom-lg border-accent/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Apple className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Foods</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{result.foods.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Different items</p>
        </Card>
      </div>

      {/* Food List */}
      <Card className="p-6 shadow-custom-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary"></span>
          Optimal Food Plan
        </h2>
        <div className="space-y-3">
          {result.foods.map(({ food, amount }) => (
            <div
              key={food.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-foreground">{food.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {food.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {amount.toFixed(0)}g • ${(food.cost * (amount / 100)).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary">
                  {((food.protein || 0) * (amount / 100)).toFixed(1)}g protein
                </p>
                <p className="text-xs text-muted-foreground">
                  {((food.energy || 0) * (amount / 100)).toFixed(0)} kcal
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Amino Acid Breakdown */}
      <Card className="p-6 shadow-custom-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary"></span>
          Essential Amino Acids Profile
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Percentage of WHO daily minimum requirement (100% = meets daily needs)
        </p>
        <div className="space-y-4">
          {(Object.keys(WHO_CONSTRAINTS) as Array<keyof typeof WHO_CONSTRAINTS>).map(
            (nutrient) => {
              const dailyValuePercent = getDailyValuePercent(nutrient);
              const isMet = isNutrientMet(nutrient);
              // Normalize bar width relative to the highest percentage
              const normalizedProgress = (dailyValuePercent / maxDailyValuePercent) * 100;

              return (
                <div key={nutrient} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize text-foreground">
                        {nutrient}
                      </span>
                      {isMet && (
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                          ✓ Met
                        </Badge>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${dailyValuePercent >= 100 ? 'text-success' : 'text-destructive'}`}>
                      {dailyValuePercent.toFixed(0)}% DV
                    </span>
                  </div>
                  <Progress
                    value={normalizedProgress}
                    className="h-2"
                  />
                </div>
              );
            }
          )}
        </div>
      </Card>

      {/* Other Nutrients (for reference) */}
      {(result.nutrients.energy || result.nutrients.protein) && (
        <Card className="p-6 shadow-custom-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
            Other Nutritional Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {result.nutrients.energy && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Energy</p>
                <p className="text-lg font-semibold text-foreground">
                  {result.nutrients.energy.toFixed(0)} kcal
                </p>
              </div>
            )}
            {result.nutrients.protein && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="text-lg font-semibold text-foreground">
                  {result.nutrients.protein.toFixed(1)} g
                </p>
              </div>
            )}
            {result.nutrients.carbs && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Carbs</p>
                <p className="text-lg font-semibold text-foreground">
                  {result.nutrients.carbs.toFixed(1)} g
                </p>
              </div>
            )}
            {result.nutrients.fat && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Fat</p>
                <p className="text-lg font-semibold text-foreground">
                  {result.nutrients.fat.toFixed(1)} g
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
