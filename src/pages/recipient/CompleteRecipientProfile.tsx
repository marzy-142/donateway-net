import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockDbService } from "@/services/mockDbService";
import { BloodType } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Layout from "@/components/Layout";
import { Textarea } from "@/components/ui/textarea";

const bloodTypes: BloodType[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const recipientFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as [
    string,
    ...string[]
  ]),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  preferredHospital: z.string().optional(),
  urgency: z.enum(["normal", "urgent", "critical"]),
  medicalCondition: z.string().optional(),
});

type RecipientFormValues = z.infer<typeof recipientFormSchema>;

const CompleteRecipientProfile: React.FC = () => {
  const { user, checkProfileCompletion } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Redirect if user is not a recipient
      if (user.role !== 'recipient') {
        navigate(user.role === 'donor' ? '/donor' : '/');
        return;
      }

      try {
        const recipients = await mockDbService.getRecipients();
        const recipient = recipients.find((r) => r.userId === user.id);

        if (recipient) {
          setIsProfileComplete(true);
          navigate("/recipient");
        }
      } catch (error) {
        console.error("Error checking profile status:", error);
      }
    };

    checkProfileStatus();
  }, [user, navigate]);

  const form = useForm<RecipientFormValues>({
    resolver: zodResolver(recipientFormSchema),
    defaultValues: {
      name: user?.name || "",
      bloodType: "O+",
      phone: "",
      preferredHospital: "",
      urgency: "normal",
      medicalCondition: "",
    },
  });

  const onSubmit = async (data: RecipientFormValues) => {
    if (!user) {
      toast.error("You must be logged in to complete your profile");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create recipient profile in database
      await mockDbService.createRecipient({
        userId: user.id,
        name: data.name,
        bloodType: data.bloodType as BloodType,
        phone: data.phone,
        preferredHospital: data.preferredHospital,
        urgency: data.urgency,
        medicalCondition: data.medicalCondition,
      });

      // Update user's profile completion status
      const userKey = `bloodlink_user_${user.id}`;
      const userData = JSON.parse(localStorage.getItem(userKey) || "{}");
      userData.hasCompletedProfile = true;
      localStorage.setItem(userKey, JSON.stringify(userData));

      // Update auth context and navigate
      await checkProfileCompletion(user);
      toast.success("Your recipient profile has been created!");
      navigate("/recipient");
    } catch (error) {
      console.error("Error creating recipient profile:", error);
      toast.error(
        "There was an error creating your profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Complete Your Recipient Profile</CardTitle>
            <CardDescription>
              Please provide your details to complete your registration as a
              blood recipient.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Type Needed</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood type needed" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bloodTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the blood type you need.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="123-456-7890" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your phone number will be used to contact you when a
                        donor is found.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferredHospital"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Hospital (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="City General Hospital" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter your preferred hospital for blood transfusion.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Indicate how urgently you need blood.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Condition (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe your medical condition or reason for needing blood"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This information helps us prioritize requests.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-bloodlink-red hover:bg-bloodlink-red/80"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Saving...
                    </span>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CompleteRecipientProfile;
