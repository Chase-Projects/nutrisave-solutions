import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptimizationResults } from "@/components/OptimizationResults";
import { FoodSearch } from "@/components/FoodSearch";
import { solveNutritionOptimization, type OptimizationResult } from "@/utils/lpSolver";
import { USDA_FOODS, type Food } from "@/utils/nutritionData";
import { Calculator, Info, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);
  const [useCustomFoods, setUseCustomFoods] = useState(false);

  const handleOptimize = (customFoods?: Food[]) => {
    setIsCalculating(true);
    // Simulate calculation time for better UX
    setTimeout(() => {
      const foodDatabase = customFoods && customFoods.length > 0 ? customFoods : USDA_FOODS;
      const optimizationResult = solveNutritionOptimization(foodDatabase);
      setResult(optimizationResult);
      setIsCalculating(false);
    }, 800);
  };

  const handleOptimizeWithSelected = () => {
    if (selectedFoods.length === 0) {
      return;
    }
    setUseCustomFoods(true);
    handleOptimize(selectedFoods);
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
            Using linear programming to find the most cost-effective plan that satisfies
            WHO essential amino acid requirements
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => handleOptimize()}
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
                  Quick Optimize
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-primary-foreground/90 text-primary border-primary/20 hover:bg-primary-foreground shadow-xl"
              onClick={() => {
                const element = document.getElementById("food-search");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Database className="w-5 h-5 mr-2" />
              Custom Food Selection
            </Button>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 mb-8">
        <Alert className="shadow-custom-lg bg-card">
          <Info className="h-4 w-4" />
          <AlertDescription>
            This tool uses Linear Programming (Simplex algorithm) to minimize daily food costs
            while meeting WHO essential amino acid requirements (histidine, isoleucine, leucine, lysine, 
            methionine, phenylalanine, threonine, tryptophan, valine). Foods must have amino acid data.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <Tabs defaultValue="optimize" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="optimize">Results</TabsTrigger>
            <TabsTrigger value="search" id="food-search">
              USDA Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="optimize" className="space-y-6">
            {result && result.feasible ? (
              <>
                {useCustomFoods && (
                  <Alert className="shadow-custom-lg bg-success/5 border-success/20">
                    <Database className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success-foreground">
                      Optimized using {selectedFoods.length} custom foods from USDA database
                    </AlertDescription>
                  </Alert>
                )}
                <OptimizationResults result={result} />
              </>
            ) : result && !result.feasible ? (
              <Alert variant="destructive" className="shadow-custom-lg">
                <AlertDescription>
                  No feasible solution found. Try selecting more diverse foods or using the default
                  database.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Calculator className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Click "Quick Optimize" or select custom foods to calculate the optimal meal plan
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <FoodSearch selectedFoods={selectedFoods} onFoodsSelected={setSelectedFoods} />
            {selectedFoods.length > 0 && (
              <div className="flex justify-center">
                <Button
                  onClick={handleOptimizeWithSelected}
                  disabled={isCalculating}
                  size="lg"
                  className="shadow-xl"
                >
                  {isCalculating ? (
                    <>
                      <Calculator className="w-5 h-5 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      Optimize with {selectedFoods.length} Selected Foods
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground space-y-2">
          <p>
            Amino acid data from food database • WHO/FAO essential amino acid requirements
          </p>
          <p className="text-xs">
            Optimization via Simplex LP Solver • Focuses on 9 essential amino acids
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
