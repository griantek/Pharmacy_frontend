'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Card,
  CardBody,
  Chip,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem
} from "@nextui-org/react";
import { API_URLS } from "@/utils/constants";

interface DeliveryOrder {
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

export default function DeliveryOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('deliveryToken');
      if (!token) {
        router.push('/delivery/login');
        return;
      }

      const response = await axios.get(
        `${API_URLS.BACKEND_URL}/delivery/orders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, status: string) => {
    try {
      const token = localStorage.getItem('deliveryToken');
      await axios.put(
        `${API_URLS.BACKEND_URL}/delivery/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card className="bg-content1">
        <CardBody>
          <h1 className="text-2xl font-bold mb-6">Delivery Orders</h1>

          <Table aria-label="Delivery orders">
            <TableHeader>
              <TableColumn>ORDER ID</TableColumn>
              <TableColumn>CUSTOMER</TableColumn>
              <TableColumn>ADDRESS</TableColumn>
              <TableColumn>MEDICINE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p>{order.user_name}</p>
                      <p className="text-small text-default-500">{order.phone_number}</p>
                    </div>
                  </TableCell>
                  <TableCell>{order.user_address}</TableCell>
                  <TableCell>
                    <div>
                      <p>{order.medicine_name}</p>
                      <p className="text-small text-default-500">Qty: {order.quantity}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={order.status === 'delivered' ? 'success' : 'primary'}
                      size="sm"
                    >
                      {order.status.toUpperCase()}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {order.status !== 'delivered' && (
                      <Select
                        size="sm"
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      >
                        <SelectItem key="dispatched" value="dispatched">Mark Dispatched</SelectItem>
                        <SelectItem key="delivered" value="delivered">Mark Delivered</SelectItem>
                      </Select>
                    )}
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