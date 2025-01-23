'use client';

import { useEffect, useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Card,
  CardBody,
  Input,
  Button,
  Chip,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URLS } from "@/utils/constants";
import moment from 'moment';

interface Order {
  id: number;
  user_name: string;
  user_address: string;
  phone_number: string;
  medicine_name: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await fetch(`${API_URLS.BACKEND_URL}/admin/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const handleCancelClick = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrderId) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${API_URLS.BACKEND_URL}/admin/orders/${selectedOrderId}`,
        { 
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setOrders(orders.filter(order => order.id !== selectedOrderId));
      setIsModalOpen(false);
    } catch (error) {
      setError('Failed to cancel order');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || (
      order.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone_number.includes(searchTerm) ||
      order.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
  
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = filteredOrders
    .filter(o => o.status === 'confirmed')
    .reduce((sum, order) => sum + order.total_price, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Order Management</h1>
      
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
            <div className="w-64">
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-48">
              <Select 
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <SelectItem key="all" value="all">All Orders</SelectItem>
                <SelectItem key="confirmed" value="confirmed">Confirmed</SelectItem>
                <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
              </Select>
            </div>

            <div className="flex gap-2">
              <Chip color="success">
                Total Revenue: ${totalRevenue.toFixed(2)}
              </Chip>
              <Chip color="primary">
                Total Orders: {filteredOrders.length}
              </Chip>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-white bg-danger-400 rounded">
              {error}
            </div>
          )}

          <Table aria-label="Orders table">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>USER</TableColumn>
              <TableColumn>ADDRESS</TableColumn>
              <TableColumn>PHONE</TableColumn>
              <TableColumn>MEDICINE</TableColumn>
              <TableColumn>QUANTITY</TableColumn>
              <TableColumn>PRICE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.user_name}</TableCell>
                  <TableCell>{order.user_address}</TableCell>
                  <TableCell>{order.phone_number}</TableCell>
                  <TableCell>{order.medicine_name}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>${order.total_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      color={order.status === 'confirmed' ? 'success' : 'danger'}
                      size="sm"
                    >
                      {order.status.toUpperCase()}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        View
                      </Button>
                      {order.status === 'confirmed' && (
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => handleCancelClick(order.id)}
                        >
                          Cancel
                        </Button>
                      )}
                      <Modal 
                        isOpen={isModalOpen} 
                        onClose={() => setIsModalOpen(false)}
                      >
                        <ModalContent>
                          <ModalHeader>Confirm Cancellation</ModalHeader>
                          <ModalBody>
                            Are you sure you want to cancel this order?
                            This action cannot be undone.
                          </ModalBody>
                          <ModalFooter>
                            <Button
                              color="default"
                              variant="flat"
                              onPress={() => setIsModalOpen(false)}
                            >
                              Close
                            </Button>
                            <Button 
                              color="danger" 
                              onPress={handleConfirmCancel}
                            >
                              Confirm Cancel
                            </Button>
                          </ModalFooter>
                        </ModalContent>
                      </Modal>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}