'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip
} from "@nextui-org/react";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { API_URLS } from "@/utils/constants";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: number;
    user_name: string;
    created_at: string;
    medicine_name: string;
    total_price: number;
    status: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await axios.get(`${API_URLS.BACKEND_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to fetch dashboard stats');
        if (error.response?.status === 401) {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardBody className="text-center">
            <h3 className="text-xl mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-primary">
              {stats?.totalOrders || 0}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <h3 className="text-xl mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-success">
              ${stats?.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardBody>
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          <Table aria-label="Recent orders table">
            <TableHeader>
              <TableColumn>ORDER ID</TableColumn>
              <TableColumn>USER</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>MEDICINE</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody>
              {stats?.recentOrders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.user_name}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{order.medicine_name}</TableCell>
                  <TableCell>${order.total_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      color={order.status === 'Pending' ? 'warning' : 'success'}
                      size="sm"
                    >
                      {order.status}
                    </Chip>
                  </TableCell>
                </TableRow>
              )) || []}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}