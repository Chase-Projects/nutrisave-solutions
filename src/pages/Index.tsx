import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OptimizationResults } from "@/components/OptimizationResults";
import { solveNutritionOptimization, type OptimizationResult } from "@/utils/lpSolver";
import { Calculator, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleOptimize = () => {
    setIsCalculating(true);
    // Simulate calculation time for better UX
    setTimeout(() => {
      const optimizationResult = solveNutritionOptimization();
      setResult(optimizationResult);
      setIsCalculating(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="gradient-hero text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
            <Calculator className="w-4 h-4" />
            <span className="text-sm font-medium">Linear Programming Optimizer</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Optimal Nutrition,
            <br />
            Minimal Cost
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Using linear programming to find the most cost-effective daily meal plan that meets
            WHO nutrition guidelines from USDA food database
          </p>

          <Button
            onClick={handleOptimize}
            disabled={isCalculating}
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-xl"
          >
            {isCalculating ? (
              <>
                <Calculator className="w-5 h-5 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5 mr-2" />
                Optimize Meal Plan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Alert */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 mb-8">
        <Alert className="shadow-custom-lg bg-card">
          <Info className="h-4 w-4" />
          <AlertDescription>
            This tool solves the classic "diet problem" using the Simplex algorithm to minimize
            daily food costs while satisfying WHO nutritional requirements. All calculations are
            performed using real USDA food data.
          </AlertDescription>
        </Alert>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {result && result.feasible ? (
          <OptimizationResults result={result} />
        ) : result && !result.feasible ? (
          <Alert variant="destructive" className="shadow-custom-lg">
            <AlertDescription>
              No feasible solution found. The constraints may be too strict or the food database
              insufficient.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Calculator className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Click "Optimize Meal Plan" to calculate the optimal nutrition solution
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>
            Food data from USDA • Nutrition guidelines from WHO • Optimization via Simplex LP
            Solver
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
