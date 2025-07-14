import { useState } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Grade {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight?: number;
}

export function GradeCalculator() {
  const [grades, setGrades] = useState<Grade[]>([
    { id: '1', name: 'Quiz 1', score: 85, maxScore: 100 },
    { id: '2', name: 'Assignment 1', score: 92, maxScore: 100 },
    { id: '3', name: 'Midterm', score: 78, maxScore: 100 },
  ]);
  
  const [newGrade, setNewGrade] = useState({
    name: '',
    score: '',
    maxScore: '100'
  });

  const addGrade = () => {
    if (newGrade.name && newGrade.score && newGrade.maxScore) {
      const grade: Grade = {
        id: Date.now().toString(),
        name: newGrade.name,
        score: parseFloat(newGrade.score),
        maxScore: parseFloat(newGrade.maxScore)
      };
      setGrades([...grades, grade]);
      setNewGrade({ name: '', score: '', maxScore: '100' });
    }
  };

  const removeGrade = (id: string) => {
    setGrades(grades.filter(g => g.id !== id));
  };

  const calculateOverallGrade = () => {
    if (grades.length === 0) return 0;
    
    const totalPoints = grades.reduce((sum, grade) => sum + grade.score, 0);
    const totalMaxPoints = grades.reduce((sum, grade) => sum + grade.maxScore, 0);
    
    return (totalPoints / totalMaxPoints) * 100;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 80) return 'text-primary';
    if (percentage >= 70) return 'text-warning';
    return 'text-error';
  };

  const overallGrade = calculateOverallGrade();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Grade Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Grades */}
        <div className="space-y-3">
          {grades.map((grade) => {
            const percentage = (grade.score / grade.maxScore) * 100;
            return (
              <div key={grade.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">{grade.name}</span>
                  <Badge variant="outline" className={getGradeColor(percentage)}>
                    {grade.score}/{grade.maxScore} ({percentage.toFixed(1)}%)
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGrade(grade.id)}
                  className="text-error hover:text-error hover:bg-error-light"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Add New Grade */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-surface border rounded-lg">
          <div>
            <Label htmlFor="grade-name" className="text-sm font-medium">Assignment</Label>
            <Input
              id="grade-name"
              placeholder="Quiz 1, Test 2..."
              value={newGrade.name}
              onChange={(e) => setNewGrade({ ...newGrade, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="grade-score" className="text-sm font-medium">Score</Label>
            <Input
              id="grade-score"
              type="number"
              placeholder="85"
              value={newGrade.score}
              onChange={(e) => setNewGrade({ ...newGrade, score: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="grade-max" className="text-sm font-medium">Max Score</Label>
            <Input
              id="grade-max"
              type="number"
              placeholder="100"
              value={newGrade.maxScore}
              onChange={(e) => setNewGrade({ ...newGrade, maxScore: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addGrade} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Overall Grade Display */}
        {grades.length > 0 && (
          <div className="text-center p-6 bg-primary-light/20 rounded-lg border border-primary/20">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Overall Grade</p>
              <div className={`text-4xl font-bold ${getGradeColor(overallGrade)}`}>
                {overallGrade.toFixed(1)}%
              </div>
              <Badge 
                variant="secondary" 
                className={`${getGradeColor(overallGrade)} bg-transparent border`}
              >
                {overallGrade >= 90 ? 'A' : 
                 overallGrade >= 80 ? 'B' : 
                 overallGrade >= 70 ? 'C' : 
                 overallGrade >= 60 ? 'D' : 'F'}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}