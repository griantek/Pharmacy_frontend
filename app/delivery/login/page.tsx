'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Card,
  CardBody,
  Input,
  Button,
  Image
} from "@nextui-org/react";
import { API_URLS } from "@/utils/constants";

export default function DeliveryLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URLS.BACKEND_URL}/delivery/login`,
        formData
      );

      localStorage.setItem('deliveryToken', response.data.token);
      localStorage.setItem('deliveryUser', JSON.stringify(response.data.user));
      
      // Trigger navbar update
      window.dispatchEvent(new Event('deliveryLoggedIn'));
      
      // Navigate and refresh
      router.push('/delivery/orders');
      router.refresh();
      
    } catch (err: any) {
      setError(err.response?.data || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 to-secondary/20">
      <Card className="w-full max-w-md">
        <CardBody className="gap-4">
          <div className="flex flex-col items-center gap-2 mb-4">
            <Image
              src="/delivery-logo.png"
              alt="Delivery Logo"
              className="w-20 h-20"
            />
            <h1 className="text-2xl font-bold">Delivery Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                username: e.target.value
              }))}
              isRequired
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                password: e.target.value
              }))}
              isRequired
            />

            {error && (
              <p className="text-danger text-sm">{error}</p>
            )}

            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Login
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}