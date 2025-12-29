import { useAuthStore } from '@/store/useAuthStore'
import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router'

export const ProtectedRoute = () => {
  const { accessToken, user, isLoading, refreshToken, fetchUser } = useAuthStore()
  //nếu chỉ kiểm tra loading, loading chỉ được bật lên khi gọi APi, còn khi component reset lại state thì loading sẽ không được bật lên,
  const [starting, setStarting] = useState(true)
  const init = async () => {
    try {
      // 1. Nếu không có accessToken → thử refresh token
      if (!accessToken) {
        await refreshToken();
      }

      // 2. Nếu có token mới, mà chưa có user → fetch user
      if (accessToken && !user) {
        await fetchUser();
      }
    } catch (err) {
      console.log("Auth error:", err);
    } finally {
      setStarting(false);
    }
  }
  // chỉ gọi 1 lần khi render 
  useEffect(() => {
    init();
  }, []);

  if (starting || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Đang tải trang ...
      </div>
    )
  }
  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }
  return (
    <Outlet>

    </Outlet>
  )
}
