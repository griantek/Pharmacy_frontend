'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Card,
  CardBody,
  Input,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { API_URLS } from "@/utils/constants";
import { User, Key, Package, Star } from "lucide-react";

interface DeliveryProfile {
  id: number;
  username: string;
  name: string;
  phone: string;
  total_deliveries: number;
  avg_rating: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DeliveryProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('deliveryToken');
      if (!token) {
        router.push('/delivery/login');
        return;
      }

      const response = await axios.get(
        `${API_URLS.BACKEND_URL}/delivery/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('deliveryToken');
      await axios.put(
        `${API_URLS.BACKEND_URL}/delivery/change-password`,
        { 
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsChangePasswordOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.response?.data || 'Failed to change password');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardBody className="gap-6">
          {/* Profile Header */}
          <div className="flex items-center justify-center p-5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl">
            <User className="w-12 h-12 text-primary mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-primary">{profile.name}</h1>
              <p className="text-default-500">Delivery Partner</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <p className="text-default-500">Username: {profile.username}</p>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <p className="text-default-500">Total Deliveries: {profile.total_deliveries}</p>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <p className="text-default-500">Average Rating: {profile.avg_rating?.toFixed(1) || 'N/A'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button 
                color="primary"
                variant="flat"
                startContent={<Key className="w-4 h-4" />}
                onPress={() => setIsChangePasswordOpen(true)}
                className="w-full"
              >
                Change Password
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Password Change Modal */}
      <Modal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)}>
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalBody>
            <Input
              type="password"
              label="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({
                ...prev,
                currentPassword: e.target.value
              }))}
            />
            <Input
              type="password"
              label="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({
                ...prev,
                newPassword: e.target.value
              }))}
            />
            <Input
              type="password"
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({
                ...prev,
                confirmPassword: e.target.value
              }))}
            />
            {error && (
              <p className="text-danger text-sm">{error}</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="flat" onPress={() => setIsChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handlePasswordChange}>
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}