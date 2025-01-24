'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Divider
} from "@nextui-org/react";
import { API_URLS } from "@/utils/constants";
import { Package, User, MapPin, Phone, DollarSign, Pill } from "lucide-react";

interface DeliveryOrder {
  id: number;
  user_name: string;
  user_address: string;
  phone_number: string;
  medicine_name: string;
  quantity: number;
  total_price: number;
  status: string;
  payment_status: 'pending' | 'paid';
  created_at: string;
}

export default function DeliveryOrdersPage() {
  const router = useRouter();
  const [currentOrder, setCurrentOrder] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  const fetchCurrentOrder = async () => {
    try {
      const token = localStorage.getItem('deliveryToken');
      if (!token) {
        router.push('/delivery/login');
        return;
      }
  
      const response = await axios.get(
        `${API_URLS.BACKEND_URL}/delivery/current-order`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentOrder(response.data);
    } catch (err) {
      setError('Failed to fetch current order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async (payment_status: string) => {
    if (!currentOrder) return;
    try {
      const token = localStorage.getItem('deliveryToken');
      await axios.put(
        `${API_URLS.BACKEND_URL}/delivery/orders/${currentOrder.id}/payment`,
        { payment_status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCurrentOrder();
    } catch (err) {
      setError('Failed to update payment status');
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!currentOrder) return;
    try {
      if (status === 'delivered' && currentOrder.payment_status !== 'paid') {
        setError('Cannot mark as delivered until payment is received');
        return;
      }

      const token = localStorage.getItem('deliveryToken');
      await axios.put(
        `${API_URLS.BACKEND_URL}/delivery/orders/${currentOrder.id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCurrentOrder();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!currentOrder) return <div className="text-center p-6">No active orders assigned</div>;

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="bg-content1">
        <CardBody className="gap-6">
          {/* Order Header */}
          <div className="flex items-center justify-center p-5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl">
            <Package className="w-12 h-12 text-primary mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-primary">Order #{currentOrder.id}</h1>
              <p className="text-default-500">Current Delivery</p>
            </div>
          </div>

          {/* Status Chips */}
          <div className="flex justify-between items-center">
            <Chip
              color={currentOrder.status === 'delivered' ? 'success' : 'primary'}
              size="lg"
            >
              {currentOrder.status.toUpperCase()}
            </Chip>
            <Chip
              color={currentOrder.payment_status === 'paid' ? 'success' : 'warning'}
              size="lg"
              className="cursor-pointer"
              onClick={() => handlePaymentUpdate(
                currentOrder.payment_status === 'paid' ? 'pending' : 'paid'
              )}
            >
              {currentOrder.payment_status.toUpperCase()}
            </Chip>
          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Customer Details</h2>
            </div>
            <div className="pl-7 space-y-2">
              <p className="text-lg font-medium">{currentOrder.user_name}</p>
              <div className="flex items-center gap-2 text-default-500">
                <MapPin className="w-4 h-4" />
                <p>{currentOrder.user_address}</p>
              </div>
              <div className="flex items-center gap-2 text-default-500">
                <Phone className="w-4 h-4" />
                <p>{currentOrder.phone_number}</p>
              </div>
            </div>
          </div>

          <Divider />

          {/* Order Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Order Details</h2>
            </div>
            <div className="pl-7 space-y-3">
              <p className="text-lg font-medium">{currentOrder.medicine_name}</p>
              <p className="text-default-500">Quantity: {currentOrder.quantity}</p>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-success" />
                <p className="text-xl font-bold text-success">
                  {currentOrder.total_price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {currentOrder.status !== 'delivered' && (
            <div className="flex gap-3 pt-4">
              <Button
                color="primary"
                className="flex-1"
                size="lg"
                onPress={() => handleStatusUpdate('dispatched')}
                isDisabled={currentOrder.status === 'dispatched'}
              >
                Mark Dispatched
              </Button>
              <Button
                color="success"
                className="flex-1"
                size="lg"
                onPress={() => handleStatusUpdate('delivered')}
                isDisabled={currentOrder.payment_status !== 'paid'}
              >
                Mark Delivered
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}