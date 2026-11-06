import LoadingSpinner from '@/components/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner color="#36d7b7" size={14} label="Synchronizing ShopSync Terminal..." />
    </div>
  );
}

