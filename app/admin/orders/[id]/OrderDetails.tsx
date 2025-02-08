'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Input,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { API_URLS } from "@/utils/constants";
import { Package, User, MapPin, Phone, MessageCircle, Pill } from "lucide-react";

interface OrderDetails {
  id: number;
  user_name: string;
  user_address: string;
  phone_number: string;
  medicine_name: string;
  medicine_price: number;
  quantity: number;
  total_price: number;
  status: 'pending' | 'verified' | 'dispatched' | 'delivered';
  payment_status: 'pending' | 'paid';
  prescription_verified: boolean;
  prescription_photo?: string;
  created_at: string;
}

interface DeliveryBoy {
  id: number;
  name: string;
  phone: string;
  current_order_id: number | null;
}

const DELIVERY_BOY_NUMBER = '917356066056';

type OrderDetailsProps = {
  id: string;
};

export default function OrderDetails({ id }: OrderDetailsProps) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState<string>('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    fetchDeliveryBoys();
  }, [id]);

  // Rest of your existing functions, just replace orderId with id
  const fetchDeliveryBoys = async () => {
    // ...existing code...
  };

  const handleAssignDelivery = async () => {
    // ...existing code but use id instead of orderId...
  };

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${API_URLS.BACKEND_URL}/order/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(response.data);
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // Rest of your existing component code, just keep the render part as is
  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ...existing JSX code... */}
    </div>
  );
}
