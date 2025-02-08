import OrderDetails from './OrderDetails';

type Props = {
  params: { id: string }
  searchParams: Record<string, string | string[] | undefined>
}

// Remove 'use client' since this is a server component
export default async function OrderPage({ params }: Props) {
  return <OrderDetails id={params.id} />;
}

// Optional: Add metadata export if needed
export const metadata = {
  title: 'Order Details'
};