
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CalendarCheck } from "lucide-react";

const Index = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Cinema Rehiyon
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Streamline your attendance tracking with our powerful monitoring system
              </p>
            </div>
            <div className="space-x-4">
              <Link to="/dashboard">
                <Button size="lg" className="mt-4">
                  View Dashboard
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="mt-4">
                  Register Attendee
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Key Features
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Everything you need to manage attendance efficiently
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-10">
              <Card className="relative overflow-hidden">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Attendee Management</h3>
                    <p className="text-sm text-gray-500">
                      Comprehensive attendee database with quick search and filtering
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <div className="rounded-full bg-primary/10 p-4">
                    <CalendarCheck className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Real-time Updates</h3>
                    <p className="text-sm text-gray-500">
                      Get instant status updates when attendees check in or out
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Get Started?
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Experience the simplicity of our powerful attendance tracking system
              </p>
            </div>
            <div className="space-x-4">
              <Link to="/register">
                <Button size="lg" className="mt-4">
                  Register Attendees
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="mt-4">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
