'use client';

import { useEffect, useState, use } from 'react';
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

const DELIVERY_BOY_NUMBER = '917356066056'; // Replace with actual number

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const orderId = params.id;
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]); 

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${API_URLS.BACKEND_URL}/order/${orderId}`, // Using orderId instead of params.id
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(response.data);
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyPrescription = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_URLS.BACKEND_URL}/order/${orderId}/verify-prescription`,
        { verified: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrderDetails();
    } catch (err) {
      setError('Failed to verify prescription');
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_URLS.BACKEND_URL}/order/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrderDetails();
    } catch (err) {
      setError('Failed to update status');
    }
  };
  const handlePaymentStatus = async (status: 'pending' | 'paid') => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_URLS.BACKEND_URL}/order/${orderId}/payment-status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrderDetails();
    } catch (err) {
      setError('Failed to update payment status');
    }
  };

  const sendWhatsAppMessage = (phone: string, message: string) => {
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`);
  };

  const sendToDelivery = () => {
    const message = `New Order #${order?.id}\n\n` +
      `Customer: ${order?.user_name}\n` +
      `Address: ${order?.user_address}\n` +
      `Phone: ${order?.phone_number}\n` +
      `Medicine: ${order?.medicine_name}\n` +
      `Quantity: ${order?.quantity}\n` +
      `Total: $${order?.total_price}`;
    
    sendWhatsAppMessage(DELIVERY_BOY_NUMBER, message);
  };

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-content1">
        <CardBody className="gap-6">
          {/* Header */}
          <div className="flex items-center justify-center p-5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl">
            <Package className="w-12 h-12 text-primary mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-primary">Order #{order.id}</h1>
              <p className="text-default-500">Order Details</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Chip
                color={
                  order.status === 'delivered' ? 'success' :
                  order.status === 'dispatched' ? 'primary' :
                  order.status === 'verified' ? 'secondary' : 
                  'warning'
                }
                size="lg"
              >
                {order.status.toUpperCase()}
              </Chip>
              <Select
                label="Update Status"
                className="max-w-xs"
                onChange={(e) => handleStatusUpdate(e.target.value)}
              >
                <SelectItem key="pending" value="pending">Pending</SelectItem>
                <SelectItem key="verified" value="verified">Verified</SelectItem>
                <SelectItem key="dispatched" value="dispatched">Dispatched</SelectItem>
                <SelectItem key="delivered" value="delivered">Delivered</SelectItem>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <Chip
                color={order.payment_status === 'paid' ? 'success' : 'warning'}
                size="lg"
              >
               {order.payment_status.toUpperCase()}
              </Chip>
              <Button
                color={order.payment_status === 'paid' ? 'success' : 'primary'}
                variant="flat"
                onPress={() => handlePaymentStatus(order.payment_status === 'paid' ? 'pending' : 'paid')}
              >
                Mark as {order.payment_status === 'paid' ? 'Unpaid' : 'Paid'}
              </Button>
            </div>
          </div> 

          {/* Customer Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Customer Details</h2>
            </div>
            <div className="pl-7 space-y-2">
              <p className="text-lg font-medium">{order.user_name}</p>
              <div className="flex items-center gap-2 text-default-500">
                <MapPin className="w-4 h-4" />
                <p>{order.user_address}</p>
              </div>
              <div className="flex items-center gap-2 text-default-500">
                <Phone className="w-4 h-4" />
                <p>{order.phone_number}</p>
              </div>
            </div>
          </div>

          {/* Medicine Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Medicine Details</h2>
            </div>
            <div className="pl-7 space-y-2">
              <p className="text-lg font-medium">{order.medicine_name}</p>
              <div className="flex justify-between text-default-500">
                <p>Quantity: {order.quantity}</p>
                <p>Total: {order.total_price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Prescription */}
          {order.prescription_photo && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Button 
                  color="primary" 
                  variant="flat"
                  onPress={() => setIsPrescriptionModalOpen(true)}
                >
                  View Prescription
                </Button>
                {!order.prescription_verified && (
                  <Button
                    color="success"
                    onPress={handleVerifyPrescription}
                  >
                    Verify Prescription
                  </Button>
                )}
                {order.prescription_verified && (
                  <Chip color="success">Prescription Verified</Chip>
                )}
              </div>
            </div>
          )}

          {/* Communication Buttons */}
          <div className="flex gap-4">
            <Button
              color="success"
              startContent={<MessageCircle />}
              onPress={() => setIsMessageModalOpen(true)}
              className="flex-1"
            >
              Message Customer
            </Button>
            <Button
              color="primary"
              startContent={<MessageCircle />}
              onPress={sendToDelivery}
              className="flex-1"
            >
              Send to Delivery
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Message Modal */}
      <Modal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Send Message to Customer</ModalHeader>
          <ModalBody>
            <Textarea
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              placeholder="Type your message here..."
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="flat" onPress={() => setIsMessageModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={() => {
                sendWhatsAppMessage(order.phone_number, customerMessage);
                setIsMessageModalOpen(false);
              }}
            >
              Send Message
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Prescription Modal */}
      <Modal 
        isOpen={isPrescriptionModalOpen} 
        onClose={() => setIsPrescriptionModalOpen(false)}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader>Prescription</ModalHeader>
          <ModalBody>
            <img 
              src={`${API_URLS.BACKEND_URL}/${order.prescription_photo}`} 
              alt="Prescription"
              className="w-full rounded-lg"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setIsPrescriptionModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}