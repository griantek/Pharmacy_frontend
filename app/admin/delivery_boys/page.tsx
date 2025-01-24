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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@nextui-org/react";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { API_URLS } from "@/utils/constants";
import { Trash2, Edit, Plus } from "lucide-react";

interface DeliveryBoy {
  id: number;
  username: string;
  name: string;
  phone: string;
  current_order_id: number | null;
  order_status?: string;
  customer_name?: string;
  delivery_address?: string;
}

interface FormData {
  username: string;
  password: string;
  name: string;
  phone: string;
}

export default function DeliveryBoysPage() {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBoy, setSelectedBoy] = useState<DeliveryBoy | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    name: '',
    phone: ''
  });

  const fetchDeliveryBoys = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await axios.get(
        `${API_URLS.BACKEND_URL}/admin/delivery-boys`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeliveryBoys(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch delivery boys');
      if (error.response?.status === 401) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();
  }, [router]);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (selectedBoy) {
        await axios.put(
          `${API_URLS.BACKEND_URL}/admin/delivery-boys/${selectedBoy.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URLS.BACKEND_URL}/admin/delivery-boys`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchDeliveryBoys();
      onClose();
      resetForm();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this delivery boy?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(
          `${API_URLS.BACKEND_URL}/admin/delivery-boys/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchDeliveryBoys();
      } catch (error: any) {
        setError(error.response?.data?.error || 'Delete failed');
      }
    }
  };

  const handleEdit = (boy: DeliveryBoy) => {
    setSelectedBoy(boy);
    setFormData({
      username: boy.username,
      password: '',
      name: boy.name,
      phone: boy.phone
    });
    onOpen();
  };

  const resetForm = () => {
    setSelectedBoy(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      phone: ''
    });
  };

  const filteredBoys = deliveryBoys.filter(boy =>
    boy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boy.phone.includes(searchTerm)
  );

  if (loading) return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Delivery Boys Management</h1>
      
      <Card className="mb-6">
        <CardBody>
          <div className="flex justify-between items-center mb-4">
            <div className="w-1/3">
              <Input
                placeholder="Search delivery boys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <Chip color="primary">
                Total: {deliveryBoys.length}
              </Chip>
              <Button
                color="primary"
                startContent={<Plus />}
                onPress={() => {
                  resetForm();
                  onOpen();
                }}
              >
                Add New
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-white bg-danger-400 rounded">
              {error}
            </div>
          )}

          <Table aria-label="Delivery boys table">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>USERNAME</TableColumn>
              <TableColumn>NAME</TableColumn>
              <TableColumn>PHONE</TableColumn>
              <TableColumn>CURRENT ORDER</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredBoys.map((boy) => (
                <TableRow key={boy.id}>
                  <TableCell>{boy.id}</TableCell>
                  <TableCell>{boy.username}</TableCell>
                  <TableCell>{boy.name}</TableCell>
                  <TableCell>{boy.phone}</TableCell>
                  <TableCell>
                {boy.current_order_id ? (
                  <div className="space-y-1">
                    <Chip 
                      color={
                        boy.order_status === 'delivered' ? 'success' :
                        boy.order_status === 'dispatched' ? 'primary' : 
                        'warning'
                      }
                      size="sm"
                    >
                      Order #{boy.current_order_id}
                    </Chip>
                    <div className="text-small text-default-500">
                      <p>{boy.customer_name}</p>
                      <p className="truncate max-w-xs">{boy.delivery_address}</p>
                    </div>
                  </div>
                ) : (
                  <Chip 
                    color="default" 
                    variant="flat" 
                    size="sm"
                  >
                    Available
                  </Chip>
                )}
              </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => handleEdit(boy)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleDelete(boy.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {selectedBoy ? 'Edit Delivery Boy' : 'Add New Delivery Boy'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                isRequired
              />
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                isRequired={!selectedBoy}
                placeholder={selectedBoy ? "Leave blank to keep current password" : ""}
              />
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                isRequired
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                isRequired
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmit}>
              {selectedBoy ? 'Update' : 'Add'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}