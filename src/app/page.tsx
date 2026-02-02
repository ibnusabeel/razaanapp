import { redirect } from 'next/navigation';

// หน้าแรก - Redirect ไปหน้า Dashboard
export default function HomePage() {
  redirect('/dashboard');
}
