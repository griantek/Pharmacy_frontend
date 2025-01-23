"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Card,
  CardBody,
  Chip
} from "@nextui-org/react";
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

interface OrderResponse {
  id: number;
  user_name: string;
  user_address: string;
  phone_number: string;
  medicine_id: number;
  quantity: number;
  status: string;
  prescription_photo: string | null;
}

export default function ModifyOrder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [formData, setFormData] = useState<FormData>({
    user_name: '',
    user_address: '',
    phone_number: '',
    medicine_id: 0,
    quantity: 1,
    prescription: null
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string>('');

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get(`${API_URLS.BACKEND_URL}/medicines`);
        setMedicines(response.data);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      }
    };

    fetchMedicines();
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get<OrderResponse>(`${API_URLS.BACKEND_URL}/order/${orderId}`);
        const order = response.data;

        if (order.status !== 'Pending') {
          alert('Only orders with "Pending" status can be modified.');
          router.push('/');
          return;
        }

        setFormData({
          user_name: order.user_name,
          user_address: order.user_address,
          phone_number: order.phone_number,
          medicine_id: order.medicine_id,
          quantity: order.quantity,
          prescription: null
        });

        setOrderStatus(order.status);
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

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
    const newErrors: Partial<FormData> = {};

    if (!formData.user_name) newErrors.user_name = "User name is required";
    if (!formData.user_address) newErrors.user_address = "User address is required";
    if (!formData.phone_number) newErrors.phone_number = "Phone number is required";
    if (!formData.medicine_id) newErrors.medicine_id = "Medicine is required";
    if (formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.patch(`${API_URLS.BACKEND_URL}/order/${orderId}`, {
        user_name: formData.user_name,
        user_address: formData.user_address,
        phone_number: formData.phone_number,
        medicine_id: formData.medicine_id,
        quantity: formData.quantity,
        prescription: formData.prescription
      });

      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push(`/confirmation?id=${orderId}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error modifying order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardBody>
          <h1 className="text-2xl font-bold mb-6 text-center">Modify Order</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phone_number}
              onChange={(e) => handleInputChange("phone_number", e.target.value)}
              isRequired
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
              Update Order
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}