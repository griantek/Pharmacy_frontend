'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Card,
  CardBody,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Select,
  SelectItem
} from "@nextui-org/react";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { API_URLS } from "@/utils/constants";

interface Medicine {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  category_name: string;
}

interface MedicineForm {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
}

export default function MedicinesPage() {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState<MedicineForm>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: 0
  });

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
  }, []);

  const fetchMedicines = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await axios.get(`${API_URLS.BACKEND_URL}/admin/medicines`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedicines(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch medicines');
      if (error.response?.status === 401) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URLS.BACKEND_URL}/categories`);
      setCategories(response.data);
    } catch (error: any) {
      setError('Failed to fetch categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (editingMedicine) {
        await axios.patch(
          `${API_URLS.BACKEND_URL}/admin/medicines/${editingMedicine.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URLS.BACKEND_URL}/admin/medicines`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchMedicines();
      onClose();
      resetForm();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      description: medicine.description,
      price: medicine.price,
      stock: medicine.stock,
      category_id: medicine.category_id
    });
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URLS.BACKEND_URL}/admin/medicines/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMedicines();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete medicine');
    }
  };

  const resetForm = () => {
    setEditingMedicine(null);
    setFormData({ name: '', description: '', price: 0, stock: 0, category_id: 0 });
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Medicine Management</h1>

      <Card className="mb-6">
        <CardBody>
          <div className="flex justify-between items-center mb-4">
            <div className="w-1/3">
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button color="primary" onPress={() => { resetForm(); onOpen(); }}>
              Add New Medicine
            </Button>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-white bg-danger-400 rounded">
              {error}
            </div>
          )}

          <Table aria-label="Medicines table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>DESCRIPTION</TableColumn>
              <TableColumn>PRICE</TableColumn>
              <TableColumn>STOCK</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredMedicines.map((medicine) => (
                <TableRow key={medicine.id}>
                  <TableCell>{medicine.name}</TableCell>
                  <TableCell>{medicine.description}</TableCell>
                  <TableCell>${medicine.price}</TableCell>
                  <TableCell>
                    <Chip
                      color={medicine.stock > 0 ? "success" : "danger"}
                      size="sm"
                    >
                      {medicine.stock} units
                    </Chip>
                  </TableCell>
                  <TableCell>{medicine.category_name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => handleEdit(medicine)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleDelete(medicine.id)}
                      >
                        Delete
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
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Medicine Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
                <Input
                  type="number"
                  label="Price"
                  value={formData.price.toString()}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  required
                />
                <Input
                  type="number"
                  label="Stock"
                  value={formData.stock.toString()}
                  onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                  required
                />
                <Select
                  label="Category"
                  placeholder="Select category"
                  value={formData.category_id.toString()}
                  onChange={(e) => setFormData({...formData, category_id: Number(e.target.value)})}
                  required
                >
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit">
                {editingMedicine ? 'Update' : 'Add'} Medicine
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}