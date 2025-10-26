import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, Send, MessageSquare, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ExpiringMembership {
  user_id: string;
  user_name: string;
  email: string;
  contact_number: string;
  package_name: string;
  end_date: string;
  days_remaining: number;
  amount: number;
}

interface ContactMessage {
  message_id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied' | 'resolved';
  created_at: string;
  admin_reply?: string;
  replied_at?: string;
}

const NotificationsAndMessages = () => {
  const [expiringMemberships, setExpiringMemberships] = useState<ExpiringMembership[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<ExpiringMembership | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reminderText, setReminderText] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'replied' | 'resolved'>('all');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchExpiringMemberships();
    fetchContactMessages();
  }, []);

  const fetchExpiringMemberships = async () => {
    try {
      // Get all active purchases
      const { data: purchases, error } = await supabase
        .from('user_purchases')
        .select(`
          *,
          user_master:user_id (
            user_id,
            user_name,
            email,
            contact_number
          )
        `)
        .eq('payment_status', 'completed')
        .order('end_date', { ascending: true });

      if (error) throw error;

      // Filter memberships expiring in 2 days or less
      const today = new Date();
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(today.getDate() + 2);

      const expiring = purchases
        ?.filter(p => {
          const endDate = new Date(p.end_date);
          return endDate > today && endDate <= twoDaysFromNow;
        })
        .map(p => ({
          user_id: p.user_master.user_id,
          user_name: p.user_master.user_name,
          email: p.user_master.email,
          contact_number: p.user_master.contact_number,
          package_name: p.package_name,
          end_date: p.end_date,
          days_remaining: Math.ceil((new Date(p.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
          amount: p.amount,
        })) || [];

      setExpiringMemberships(expiring);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch expiring memberships',
        variant: 'destructive',
      });
    }
  };

  const fetchContactMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContactMessages(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch contact messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openReplyDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyText(message.admin_reply || '');
    setReplyDialogOpen(true);
  };

  const openReminderDialog = (membership: ExpiringMembership) => {
    setSelectedMembership(membership);
    setReminderText(
      `Dear ${membership.user_name},\n\n` +
      `This is a friendly reminder that your gym membership "${membership.package_name}" will expire in ${membership.days_remaining} day${membership.days_remaining > 1 ? 's' : ''} on ${new Date(membership.end_date).toLocaleDateString()}.\n\n` +
      `To ensure uninterrupted access to our gym facilities, please renew your membership at your earliest convenience.\n\n` +
      `If you have any questions or need assistance, feel free to contact us.\n\n` +
      `Best regards,\nGym Management Team`
    );
    setReminderDialogOpen(true);
  };

  // Helper function to send reply email
const sendReplyEmail = async (
  email: string,
  userName: string,
  userSubject: string,
  userMessage: string,
  adminReply: string
) => {
  try {
    const response = await fetch("http://localhost:5000/api/send-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        userName,
        userSubject,
        userMessage,
        adminReply,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error sending reply email:", err);
    throw err;
  }
};

// Helper function to send reminder email
const sendReminderEmail = async (
  email: string,
  userName: string,
  packageName: string,
  daysRemaining: number,
  endDate: string,
  message: string
) => {
  try {
    const response = await fetch("http://localhost:5000/api/send-reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        userName,
        packageName,
        daysRemaining,
        endDate,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error sending reminder email:", err);
    throw err;
  }
};

// Updated handleReplyToMessage function
const handleReplyToMessage = async () => {
  if (!selectedMessage || !replyText.trim()) {
    toast({
      title: 'Error',
      description: 'Please enter a reply message',
      variant: 'destructive',
    });
    return;
  }

  setSendingEmail(true);
  try {
    // Update message with reply in database
    const { error: updateError } = await supabase
      .from('user_messages')
      .update({
        admin_reply: replyText,
        status: 'replied',
        replied_at: new Date().toISOString(),
      })
      .eq('message_id', selectedMessage.message_id);

    if (updateError) throw updateError;

    // Send actual email
    await sendReplyEmail(
      selectedMessage.email,
      selectedMessage.name,
      selectedMessage.subject,
      selectedMessage.message,
      replyText
    );

    toast({
      title: 'Success',
      description: `Reply sent to ${selectedMessage.email}`,
    });

    setReplyDialogOpen(false);
    setReplyText('');
    fetchContactMessages();
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to send reply',
      variant: 'destructive',
    });
  } finally {
    setSendingEmail(false);
  }
};

  // Updated handleSendReminder function
const handleSendReminder = async () => {
  if (!selectedMembership || !reminderText.trim()) {
    toast({
      title: 'Error',
      description: 'Please enter a reminder message',
      variant: 'destructive',
    });
    return;
  }

  setSendingEmail(true);
  try {
    // Send actual email
    await sendReminderEmail(
      selectedMembership.email,
      selectedMembership.user_name,
      selectedMembership.package_name,
      selectedMembership.days_remaining,
      selectedMembership.end_date,
      reminderText
    );

    toast({
      title: 'Reminder Sent',
      description: `Membership expiry reminder sent to ${selectedMembership.user_name}`,
    });

    setReminderDialogOpen(false);
    setReminderText('');
    setSelectedMembership(null);
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to send reminder',
      variant: 'destructive',
    });
  } finally {
    setSendingEmail(false);
  }
};

  const markAsResolved = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('user_messages')
        .update({ status: 'resolved' })
        .eq('message_id', messageId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Message marked as resolved',
      });

      fetchContactMessages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredMessages = contactMessages.filter(msg => {
    if (filterStatus === 'all') return true;
    return msg.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-orange-100 text-orange-800',
      replied: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  return (
    <div className="space-y-6">
      {/* Expiring Memberships Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bell className="mr-3 text-orange-500" size={24} />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Expiring Memberships</h3>
              <p className="text-sm text-gray-600">Members whose plans expire within 2 days</p>
            </div>
          </div>
          {expiringMemberships.length > 0 && (
            <Badge className="bg-orange-500 text-white">
              {expiringMemberships.length} Alert{expiringMemberships.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {expiringMemberships.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <CheckCircle className="mx-auto mb-2 text-green-500" size={48} />
            <p className="text-gray-600">No memberships expiring soon</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expiringMemberships.map((membership) => (
              <div
                key={membership.user_id}
                className="border border-orange-200 bg-orange-50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="text-orange-600" size={18} />
                      <h4 className="font-semibold text-lg">{membership.user_name}</h4>
                      <Badge className="bg-red-500 text-white">
                        {membership.days_remaining} day{membership.days_remaining !== 1 ? 's' : ''} left
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      <p><strong>Email:</strong> {membership.email}</p>
                      <p><strong>Phone:</strong> {membership.contact_number}</p>
                      <p><strong>Package:</strong> {membership.package_name}</p>
                      <p><strong>Expires:</strong> {new Date(membership.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => openReminderDialog(membership)}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Mail size={14} className="mr-1" />
                    Send Reminder
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Messages Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MessageSquare className="mr-3 text-blue-500" size={24} />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Contact Messages</h3>
              <p className="text-sm text-gray-600">User queries from contact form</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All ({contactMessages.length})
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('pending')}
              className={filterStatus === 'pending' ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              Pending ({contactMessages.filter(m => m.status === 'pending').length})
            </Button>
            <Button
              variant={filterStatus === 'replied' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('replied')}
              className={filterStatus === 'replied' ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              Replied ({contactMessages.filter(m => m.status === 'replied').length})
            </Button>
            <Button
              variant={filterStatus === 'resolved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('resolved')}
              className={filterStatus === 'resolved' ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              Resolved ({contactMessages.filter(m => m.status === 'resolved').length})
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <MessageSquare className="mx-auto mb-2 text-gray-400" size={48} />
            <p className="text-gray-600">No messages found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((message) => (
              <div
                key={message.message_id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-lg">{message.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(message.status)}`}>
                        {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <p><strong>Email:</strong> {message.email}</p>
                      <p><strong>Phone:</strong> {message.phone}</p>
                      <p><strong>Subject:</strong> {message.subject}</p>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Message:</strong> {message.message}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock size={12} className="mr-1" />
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {message.admin_reply && (
                  <div className="mt-3 pt-3 border-t bg-blue-50 p-3 rounded">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Admin Reply:</p>
                    <p className="text-sm text-blue-800">{message.admin_reply}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Replied on {new Date(message.replied_at!).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={() => openReplyDialog(message)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Mail size={14} className="mr-1" />
                    {message.status === 'pending' ? 'Reply' : 'Edit Reply'}
                  </Button>
                  {message.status !== 'resolved' && (
                    <Button
                      onClick={() => markAsResolved(message.message_id)}
                      size="sm"
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1"><strong>From:</strong> {selectedMessage?.email}</p>
              <p className="text-sm text-gray-600 mb-1"><strong>Subject:</strong> {selectedMessage?.subject}</p>
              <p className="text-sm text-gray-700 mt-2"><strong>Message:</strong></p>
              <p className="text-sm text-gray-700">{selectedMessage?.message}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Reply <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setReplyDialogOpen(false);
                  setReplyText('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                onClick={handleReplyToMessage}
                disabled={sendingEmail || !replyText.trim()}
              >
                {sendingEmail ? (
                  'Sending...'
                ) : (
                  <>
                    <Send size={16} className="mr-1" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Membership Expiry Reminder</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-orange-600" size={20} />
                <p className="font-semibold text-orange-900">Member Details</p>
              </div>
              <p className="text-sm text-gray-700"><strong>Name:</strong> {selectedMembership?.user_name}</p>
              <p className="text-sm text-gray-700"><strong>Email:</strong> {selectedMembership?.email}</p>
              <p className="text-sm text-gray-700"><strong>Package:</strong> {selectedMembership?.package_name}</p>
              <p className="text-sm text-gray-700">
                <strong>Expires in:</strong> {selectedMembership?.days_remaining} day{selectedMembership?.days_remaining !== 1 ? 's' : ''}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Reminder Message <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 min-h-[250px] focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setReminderDialogOpen(false);
                  setReminderText('');
                  setSelectedMembership(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={handleSendReminder}
                disabled={sendingEmail || !reminderText.trim()}
              >
                {sendingEmail ? (
                  'Sending...'
                ) : (
                  <>
                    <Send size={16} className="mr-1" />
                    Send Reminder
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationsAndMessages;