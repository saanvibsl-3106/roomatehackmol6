
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

const questionnaireSchema = z.object({
  hometown: z.enum(["yes", "no"]),
  nonVegetarian: z.enum(["yes", "no"]),
  smoking: z.enum(["yes", "no"]),
  alcohol: z.enum(["yes", "no", "occasionally"]),
  religion: z.enum(["any", "own"]),
  dailyRhythm: z.enum(["early_bird", "night_owl"]),
  personality: z.enum(["introvert", "extrovert"]),
  houseParties: z.enum(["yes", "no"]),
  splitGroceries: z.enum(["yes", "no"]),
  chores: z.enum(["self", "maid", "outsource"]),
  sharedSpaces: z.enum(["alternate", "maid", "relaxed"]),
  noiseLevel: z.enum(["quiet", "regular"]),
  pets: z.enum(["yes", "no", "depends"]),
  guests: z.enum(["yes", "no", "notice"]),
  sharing: z.enum(["yes", "no", "selective"]),
  gender: z.enum(["male", "female", "any"]),
});

type QuestionnaireData = z.infer<typeof questionnaireSchema>;

export default function QuestionnairePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  
  const form = useForm<QuestionnaireData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      hometown: "no",
      nonVegetarian: "yes",
      smoking: "no",
      alcohol: "no",
      religion: "any",
      dailyRhythm: "early_bird",
      personality: "introvert",
      houseParties: "no",
      splitGroceries: "yes",
      chores: "self",
      sharedSpaces: "alternate",
      noiseLevel: "quiet",
      pets: "depends",
      guests: "notice",
      sharing: "selective",
      gender: "any",
    },
  });

  const questions = [
    {
      field: "hometown",
      title: "Would you prefer a roommate from the same hometown?",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    },
    {
      field: "nonVegetarian",
      title: "Are you comfortable living with a non-vegetarian roommate?",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    },
    // Add more questions based on your list...
  ];

  const currentQuestion = questions[currentStep - 1];

  const onSubmit = (data: QuestionnaireData) => {
    console.log(data);
    // Here you can send the data to your backend
    navigate('/profile');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Roommate Preferences</CardTitle>
          <CardDescription>
            Step {currentStep} of {questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name={currentQuestion.field as keyof QuestionnaireData}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{currentQuestion.title}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        {currentQuestion.options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <label htmlFor={option.value}>{option.label}</label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                {currentStep === questions.length ? (
                  <Button type="submit">Complete</Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.min(questions.length, prev + 1))}
                  >
                    Next
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
