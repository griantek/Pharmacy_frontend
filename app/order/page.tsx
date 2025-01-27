'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Input, Button, Select, SelectItem, Chip, Divider } from "@nextui-org/react";
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URLS } from "@/utils/constants";

interface FormData {
  user_name: string;
  user_address: string;
  phone_number: string;
  medicine_id: number;
  quantity: number;
  prescription: File | null;
}

interface Medicine {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export default function OrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ [key in keyof FormData]?: string }>({
    user_name: undefined,
    user_address: undefined,
    phone_number: undefined,
    medicine_id: undefined as string | undefined,
    quantity: undefined,
    prescription: undefined
  });
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [formData, setFormData] = useState<FormData>({
    user_name: '',
    user_address: '',
    phone_number: '',
    medicine_id: 0,
    quantity: 1,
    prescription: null
  });

  useEffect(() => {
    const validateToken = async (token: string) => {
      try {
        const response = await axios.get(`${API_URLS.BACKEND_URL}/validate-token`, {
          params: { token }
        });
        const { name, phone } = response.data;
        setFormData(prev => ({
          ...prev,
          user_name: name || '',
          phone_number: phone || ''
        }));
      } catch (error) {
        console.error('Token validation failed:', error);
        router.push('/tokenexp'); // Redirect to home page on invalid token
      }
    };

    const fetchMedicines = async () => {
      try {
        const response = await axios.get(`${API_URLS.BACKEND_URL}/medicines`);
        setMedicines(response.data);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      }
    };

    const token = searchParams.get('token');
    if (token) {
      validateToken(token);
    } else {
      router.push('/tokenexp'); // Redirect if no token
    }

    fetchMedicines();
  }, [searchParams, router]);

  const handleInputChange = (field: keyof FormData, value: string | number | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({
      ...prev,
      [field]: undefined
    }));
  };

  const validateForm = () => {
    const newErrors: { [key in keyof FormData]?: string } = {};

    if (!formData.user_name) newErrors.user_name = "User name is required";
    if (!formData.user_address) newErrors.user_address = "User address is required";
    if (!formData.phone_number) newErrors.phone_number = "Phone number is required";
    if (!formData.medicine_id || isNaN(formData.medicine_id)) newErrors.medicine_id = "Medicine is required";
    if (formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('user_name', formData.user_name);
    formDataToSend.append('user_address', formData.user_address);
    formDataToSend.append('phone_number', formData.phone_number);
    formDataToSend.append('medicine_id', formData.medicine_id.toString());
    formDataToSend.append('quantity', formData.quantity.toString());
    if (formData.prescription) {
      formDataToSend.append('prescription', formData.prescription);
    }

    try {
      const response = await axios.post(`${API_URLS.BACKEND_URL}/order`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data) {
        setMessage('Order placed successfully!');
        router.push(`/confirmation?id=${response.data.orderId}`);
      }
    } catch (error) {
      setMessage('Failed to place order. Please try again.');
      console.error('Order failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Place your order</h1>
      {message && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded">
          {message}
        </div>
      )}
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="User Name"
              placeholder="Enter your name"
              value={formData.user_name}
              onChange={(e) => handleInputChange("user_name", e.target.value)}
              isRequired
            />

            <Input
              label="User Address"
              placeholder="Enter your address"
              value={formData.user_address}
              onChange={(e) => handleInputChange("user_address", e.target.value)}
              isRequired
            />
            <input 
              type="hidden" 
              name="phone_number" 
              value={formData.phone_number} 
            /> 
             

            <Select
              label="Medicine"
              placeholder="Select medicine"
              value={formData.medicine_id.toString()}
              onChange={(e) => handleInputChange("medicine_id", parseInt(e.target.value))}
              errorMessage={errors.medicine_id}
              isRequired
            >
              {medicines.map((medicine) => (
                <SelectItem key={medicine.id} value={medicine.id.toString()}>
                  {medicine.name}
                </SelectItem>
              ))}
            </Select>

            <Input
              type="number"
              label="Quantity"
              min="1"
              value={formData.quantity.toString()}
              onChange={(e) => handleInputChange("quantity", parseInt(e.target.value))}
              required
            />

            <Input
              type="file"
              label="Prescription (Optional)"
              onChange={(e) => handleInputChange("prescription", e.target.files ? e.target.files[0] : null)}
            />

            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              className="w-full"
            >
              Place Order
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}