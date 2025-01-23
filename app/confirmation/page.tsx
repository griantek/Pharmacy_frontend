'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardBody, Button, Skeleton, Chip } from "@nextui-org/react";
import { CheckCircle, Package } from "lucide-react";
import { API_URLS } from "@/utils/constants";

interface OrderDetails {
  id: number;
  user_name: string;
  user_address: string;
  phone_number: string;
  medicine_name: string;
  medicine_price: number;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  prescription_photo?: string;
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`${API_URLS.BACKEND_URL}/order/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        setError('Failed to load order details');
        console.error('Error fetching order:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <Skeleton className="h-64 rounded-lg"/>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto p-4">
        <Card>
          <CardBody>
            <p className="text-center text-danger">{error || 'Order not found'}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardBody className="space-y-6">
          <div className="flex items-center justify-center">
            <Package className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-xl font-semibold">Order #{order.id}</h1>
          </div>

          <Chip 
            color={order.status === 'Pending' ? 'warning' : 'success'}
            className="mx-auto"
          >
            {order.status.toUpperCase()}
          </Chip>

          <div className="rounded-lg space-y-4 p-4 bg-gray-50">
            <div>
              <p className="text-sm text-gray-500">Customer Details</p>
              <p className="font-medium">{order.user_name}</p>
              <p className="text-sm">{order.user_address}</p>
              <p className="text-sm">{order.phone_number}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Medicine Details</p>
              <p className="font-medium">{order.medicine_name}</p>
              <div className="flex justify-between text-sm">
                <span>Quantity: {order.quantity} units</span>
                <span>Price per unit: ${order.medicine_price}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Order Info</p>
              <p className="text-sm">Placed on: {formatDateTime(order.created_at)}</p>
              <p className="font-medium text-lg mt-2">
                Total Amount: ${order.total_price.toFixed(2)}
              </p>
            </div>

            {order.prescription_photo && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Prescription</p>
                <img 
                  src={`${API_URLS.BACKEND_URL}/${order.prescription_photo}`} 
                  alt="Prescription"
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              color="primary"
              className="flex-1"
              onClick={() => window.location.href = `https://wa.me/${order.phone_number.replace(/[^0-9]/g, '')}`}
            >
              Contact via WhatsApp
            </Button>
            {order.status === 'Pending' && (
              <Button
                color="danger"
                variant="flat"
                className="flex-1"
                onClick={() => window.print()}
              >
                Print Order
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}