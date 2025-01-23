'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardBody, Button, Skeleton, Chip } from "@nextui-org/react";
import { API_URLS } from "@/utils/constants";
import { 
  User, 
  MapPin, 
  Phone, 
  Pill, 
  Calendar, 
  DollarSign, 
  MessageCircle,
  Printer, 
  Package 
} from "lucide-react";

interface OrderDetails {
  id: number;
  user_name: string;
  user_address: string;
  phone_number: string;
  medicine_id: number;
  medicine_name: string;
  medicine_price: number;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
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
      <Card className="bg-content1 border-none">
        <CardBody className="gap-5">
          {/* Header Section */}
          <div className="flex items-center justify-center p-5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl">
            <Package className="w-12 h-12 text-primary mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-primary">#{order.id}</h1>
              <p className="text-default-500">Order Confirmation</p>
            </div>
          </div>
  
          {/* Status Badge */}
          <div className="flex justify-center">
            <Chip
              color={order.status === 'Pending' ? 'warning' : 'success'}
              variant="shadow"
              className="px-4 py-2"
              size="lg"
            >
              {order.status.toUpperCase()}
            </Chip>
          </div>
  
          {/* Details Sections */}
          <div className="space-y-6 bg-content2 rounded-xl p-6">
            {/* Customer Section */}
            <div className="border-b border-divider pb-4">
              <div className="flex items-center mb-3">
                <User className="w-5 h-5 text-primary mr-2" />
                <h2 className="text-default-900 font-semibold">Customer Details</h2>
              </div>
              <div className="space-y-2 pl-7">
                <p className="text-xl font-semibold text-default-900">{order.user_name}</p>
                <div className="flex items-center text-default-500">
                  <MapPin className="w-4 h-4 mr-2" />
                  <p>{order.user_address}</p>
                </div>
                <div className="flex items-center text-default-500">
                  <Phone className="w-4 h-4 mr-2" />
                  <p>{order.phone_number}</p>
                </div>
              </div>
            </div>
  
            {/* Medicine Section */}
            <div className="border-b border-divider pb-4">
              <div className="flex items-center mb-3">
                <Pill className="w-5 h-5 text-primary mr-2" />
                <h2 className="text-default-900 font-semibold">Medicine Details</h2>
              </div>
              <div className="pl-7 space-y-3">
                <p className="text-xl font-semibold text-default-900">{order.medicine_name}</p>
                <div className="flex justify-between text-default-500">
                  <span>Quantity: {order.quantity} units</span>
                  <span>Price: ${order.medicine_price} per unit</span>
                </div>
              </div>
            </div>
  
            {/* Order Info Section */}
            <div>
              <div className="flex items-center mb-3">
                <Calendar className="w-5 h-5 text-primary mr-2" />
                <h2 className="text-default-900 font-semibold">Order Information</h2>
              </div>
              <div className="pl-7 space-y-3">
                <p className="text-default-500">
                  Placed on: {formatDateTime(order.created_at)}
                </p>
                <p className="text-2xl font-bold text-success">
                  Total: ${order.total_price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
  
          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              color="success"
              size="lg"
              className="flex-1"
              startContent={<MessageCircle className="w-5 h-5" />}
              onClick={() => window.location.href = `https://wa.me/${order.phone_number.replace(/[^0-9]/g, '')}`}
            >
              WhatsApp
            </Button>
            {order.status === 'Pending' && (
              <Button
                color="primary"
                variant="flat"
                size="lg"
                className="flex-1"
                startContent={<Printer className="w-5 h-5" />}
                onClick={() => window.print()}
              >
                Print
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );

}