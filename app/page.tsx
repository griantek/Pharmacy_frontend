'use client';

import { Button, Card, CardBody } from "@nextui-org/react";
import { useRouter } from 'next/navigation';
import { Pill, Truck, Phone } from "lucide-react";
import bgImage from "@/utils/bg.jpg"
export default function WelcomePage() {
  const router = useRouter();

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${bgImage.src})`,
      }}
    >
      <div className="max-w-6xl mx-auto p-6">
      {/* Hero Section */}
      <div className="text-center py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
        MedCare Pharmacy
        </h1>
        <p className="text-xl mb-8 text-gray-200">
        Your Health, Our Priority
        </p>
        <div className="flex gap-4 justify-center">
        <Button 
          color="primary" 
          size="lg"
          onPress={() => router.push('/admin/login')}
          className="font-semibold"
        >
          Admin Login
        </Button>
        <Button 
          color="secondary" 
          size="lg"
          onPress={() => router.push('/delivery/login')}
          className="font-semibold"
        >
          Delivery Login
        </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
        <Card className="bg-content1/80 backdrop-blur-md">
        <CardBody className="text-center p-6">
          <div className="flex justify-center mb-4">
          <Pill className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-foreground">Wide Medicine Range</h3>
          <p className="text-foreground-500">
          Comprehensive selection of medicines and healthcare products
          </p>
        </CardBody>
        </Card>

        <Card className="bg-content1/80 backdrop-blur-md">
        <CardBody className="text-center p-6">
          <div className="flex justify-center mb-4">
          <Truck className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-foreground">Fast Delivery</h3>
          <p className="text-foreground-500">
          Quick and reliable medicine delivery to your doorstep
          </p>
        </CardBody>
        </Card>

        <Card className="bg-content1/80 backdrop-blur-md">
        <CardBody className="text-center p-6">
          <div className="flex justify-center mb-4">
          <Phone className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-foreground">24/7 Support</h3>
          <p className="text-foreground-500">
          Round-the-clock customer service and healthcare advice
          </p>
        </CardBody>
        </Card>
      </div>

      {/* Contact Section */}
      <Card className="mt-12 bg-content1/80 backdrop-blur-md">
        <CardBody className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Contact Us</h2>
        <p className="text-foreground-500 mb-2">123 Healthcare Avenue, Kochi</p>
        <p className="text-foreground-500 mb-2">Phone: +91 735 606 6056</p>
        <p className="text-foreground-500">Email: info@medcarepharmacy.com</p>
        </CardBody>
      </Card>
      </div>
    </div>
  );
}