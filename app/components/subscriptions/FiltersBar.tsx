import { Search, ChevronDown, Download } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { fetchBranchesThunk } from "~/store/branchesSlice";

interface FiltersBarProps {
  // values
  searchTerm: string;
  subscriptionTypeFilter: string;
  customerTypeFilter: string;
  startDate: string;
  endDate: string;
  // setters
  setSearchTerm: (v: string) => void;
  setSubscriptionTypeFilter: (v: string) => void;
  setCustomerTypeFilter: (v: string) => void;
  setStartDate: (v: string) => void;
  setEndDate: (v: string) => void;
  clearDates: () => void;
  // role
  isAdminOrCashier: boolean;
  isCashier: boolean;
  // actions
  onExport: () => void;
}

export default function FiltersBar({
  searchTerm,
  subscriptionTypeFilter,
  customerTypeFilter,
  startDate,
  endDate,
  setSearchTerm,
  setSubscriptionTypeFilter,
  setCustomerTypeFilter,
  setStartDate,
  setEndDate,
  clearDates,
  isAdminOrCashier,
  isCashier,
  onExport,
}: FiltersBarProps) {
  const [openAddSubscription, setOpenAddSubscription] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    regNumber: '',
    days: '',
    subscriptionType: 'VVIP',
    branch: '',
    paymentMode: '',
    amount: ''
  });
  const dispatch = useAppDispatch();
  const { items: branches, loading: branchesLoading, error: branchesError, loaded: branchesLoaded } = useAppSelector((s) => s.branches);
  const authToken = useAppSelector((s) => (s.auth as any)?.token || (s.auth as any)?.user?.token);

  // Fetch actual branches from backend when sheet opens (and on mount for convenience)
  useEffect(() => {
    if (!branchesLoaded && !branchesLoading) {
      dispatch(fetchBranchesThunk());
    }
  }, [branchesLoaded, branchesLoading, dispatch]);

  useEffect(() => {
    if (!formData.branch && branches.length > 0) {
      setFormData((fd) => ({ ...fd, branch: branches[0].id }));
    }
  }, [branches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setServerError('');
    try {
      const token = authToken;
      if (!token) {
        setServerError('Not authenticated. Please log in again.');
        setSubmitting(false);
        return;
      }

      // 1) Ensure/create student via users endpoint as role "student"
      // Build payload according to previous users API structure
      const newUserPayload: any = {
        name: formData.name.trim(),
        role: 'student',
        branch_id: await resolveBranchId(formData.branch, token),
      };
      if (formData.regNumber.trim()) {
        newUserPayload.reg_number = formData.regNumber.trim();
      }

      const createUserResp = await fetch('https://restaurant-bn-api.onrender.com/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Users API uses raw token Authorization per existing app convention
          'Authorization': token,
        },
        body: JSON.stringify(newUserPayload),
      });

      if (!createUserResp.ok) {
        let msg = 'Failed to create student';
        try {
          const j = await createUserResp.json();
          msg = j.message || j.error || msg;
        } catch {}
        throw new Error(msg);
      }
      const createdUser = await createUserResp.json();
      const studentId: number = Number(createdUser?.data?.id || createdUser?.id);
      if (!studentId) throw new Error('Student ID missing from create user response');

      // 2) Create student subscription
      const subscriptionResp = await fetch('https://restaurant-bn-api.onrender.com/api/student-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
        body: JSON.stringify({
          studentId,
          branchId: newUserPayload.branch_id,
          mealType: normalizeMealType(formData.subscriptionType),
          mealCount: Number(formData.days)*2 || 1,
          // Optional fields that backend may ignore: amount/paymentMode could be part of payments API
        }),
      });

      if (!subscriptionResp.ok) {
        let msg = 'Failed to create subscription';
        try {
          const j = await subscriptionResp.json();
          msg = j.message || j.error || msg;
        } catch {}
        throw new Error(msg);
      }

      alert(`Subscription for ${formData.name} has been created`);
      setFormData({
        name: '',
        regNumber: '',
        days: '',
        subscriptionType: 'VVIP',
        branch: 'KIGALI',
        paymentMode: '',
        amount: ''
      });
      setOpenAddSubscription(false);
    } catch (err: any) {
      setServerError(err?.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Helpers
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  function normalizeMealType(v: string) {
    const map: Record<string, string> = { VVIP: 'VVIP', Vip: 'VIP', Ordinary: 'Regular' };
    return map[v] || 'Regular';
  }
  async function resolveBranchId(branchLabel: string, token: string): Promise<string> {
    // If user selected a name like KIGALI, try to find matching branch by name; otherwise assume it's already an ID
    if (!branchLabel) return branchLabel;
    try {
      const resp = await fetch('https://restaurant-bn-api.onrender.com/api/branches', {
        headers: { Authorization: token },
      });
      if (!resp.ok) return branchLabel;
      const j = await resp.json();
      const list = Array.isArray(j?.data) ? j.data : [];
      const found = list.find((b: any) => String(b?.name).toUpperCase() === branchLabel.toUpperCase());
      return found?.id ? String(found.id) : branchLabel;
    } catch {
      return branchLabel;
    }
  }

  return (
    <div className="flex flex-col p-4 border-b border-gray-200 gap-4">
      <div className="w-full md:flex-1 md:max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search by name or card ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 border-gray-300"
        />
      </div>
      <div className="">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
            <select
              className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white w-full md:w-auto"
              value={subscriptionTypeFilter}
              onChange={(e) => setSubscriptionTypeFilter(e.target.value)}
            >
              <option value="All">Subscription Type: All</option>
              <option value="VVIP">VVIP</option>
              <option value="Vip">VIP</option>
              <option value="Ordinary">Ordinary</option>
            </select>
            <div className="relative w-full md:w-auto">
              <select
                value={customerTypeFilter}
                onChange={(e) => setCustomerTypeFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white w-full md:w-auto "
              >
                <option value="All">Customer Type: All</option>
                <option value="Student">Student</option>
                <option value="Campus Worker">Campus Worker</option>
                <option value="Regular">Regular</option>
              </select>
            </div>
            {!isCashier && (
              <Button variant="outline" className="text-sm border-gray-300">
                Branch <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            )}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 py-1 w-full md:w-auto">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-sm outline-none"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-sm outline-none"
                />
              </div>
              {(startDate || endDate) && (
                <Button variant="ghost" className="text-sm" onClick={clearDates}>
                  Clear
                </Button>
              )}
            </div>
            <Button variant="outline" className="text-sm border-gray-300" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            {isAdminOrCashier&&
                      <Button 
                        className="text-sm text-white bg-primary-100"
                        onClick={() => setOpenAddSubscription(true)}
                      >
                        Add Subscription
                      </Button>
            }
          </div>
        </div>
      </div>

      {/* Add Subscription Sheet */}
      <Sheet open={openAddSubscription} onOpenChange={setOpenAddSubscription}>
        <SheetContent side='right' className='w-full sm:max-w-lg bg-white p-6 border-none h-screen max-h-screen overflow-y-auto'>
          <SheetHeader>
            <SheetTitle>Record New Subscription</SheetTitle>
            <SheetDescription>Provide customer and subscription details, then submit.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className='mt-6 space-y-6'>
            {serverError && (
              <div className='bg-red-50 text-red-600 p-3 rounded-md text-sm'>
                {serverError}
              </div>
            )}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Name</label>
                <input
                  className='w-full border rounded-md px-3 py-2'
                  placeholder='Enter full name'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Reg number</label>
                <input 
                  className='w-full border rounded-md px-3 py-2' 
                  placeholder='e.g., RG-12345'
                  value={formData.regNumber}
                  onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                  required
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Days</label>
                <input 
                  type='number' 
                  min={1} 
                  className='w-full border rounded-md px-3 py-2' 
                  placeholder='e.g., 30'
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                  required
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Subscription</label>
                <select 
                  className='w-full border rounded-md px-3 py-2'
                  value={formData.subscriptionType}
                  onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value })}
                >
                  <option value='VVIP'>VVIP</option>
                  <option value='Vip'>VIP</option>
                  <option value='Ordinary'>Ordinary</option>
                </select>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Branch</label>
                <select
                  className='w-full border rounded-md px-3 py-2'
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  required
                >
                  <option value='' disabled>
                    {branchesLoading ? 'Loading branches...' : 'Select a branch'}
                  </option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name || b.id}</option>
                  ))}
                </select>
                {branchesError && (
                  <p className='text-xs text-red-600'>Failed to load branches: {branchesError}</p>
                )}
              </div>
              <div className='space-y-2 md:col-span-1'>
                <label className='text-sm font-medium text-gray-700'>Payment mode</label>
                <select 
                  className='w-full border rounded-md px-3 py-2'
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  required
                >
                  <option value=''>Select payment method</option>
                  <option value='Cash'>Cash</option>
                  <option value='Mobile Money'>Mobile Money</option>
                  <option value='Bank Transfer'>Bank Transfer</option>
                </select>
              </div>
              <div className='space-y-2 md:col-span-2'>
                <label className='text-sm font-medium text-gray-700'>Amount to Pay</label>
                <input 
                  type='number' 
                  min={1} 
                  className='w-full border rounded-md px-3 py-2' 
                  placeholder='e.g., 3000 Rwf'
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className='flex gap-2 justify-end'>
              <Button 
                type="button"
                variant="outline"
                onClick={() => setOpenAddSubscription(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className='bg-blue-600 text-white px-6' disabled={submitting}>
                {submitting ? 'Submitting...' : 'SUBMIT'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
