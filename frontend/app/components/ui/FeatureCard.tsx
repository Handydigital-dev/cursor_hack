import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
  }
  
  export function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex flex-col items-center">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold">{title}</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{description}</p>
        </CardContent>
      </Card>
    );
  }