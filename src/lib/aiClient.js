// AI Helpdesk client — uses Claude claude-sonnet-4-20250514 if key is set, else smart mock bot
const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY || ''

const SYSTEM_PROMPT = `You are SlotIQ Assistant, the helpful AI support agent for SlotIQ — a Bengaluru-based app for parking booking, sports venue booking, and city discovery.

You know everything about the app:
- Parking: users can find and book parking slots hourly (₹15–150/hr), daily (save 20%), weekly (save 35%), monthly (save 50%). Scan & Park lets users scan a host QR to start instantly.
- Sports: users can book football grounds, badminton courts, cricket turfs, basketball courts, tennis clubs by time slot.
- Discover: find restaurants, cafes, bars, malls, ATMs, EV charging, petrol stations, washrooms.
- Host mode: any user can list their parking or sports venue to earn money by switching to Host Mode in their profile.
- Payment: UPI (GPay/PhonePe/Paytm), card, or SlotIQ wallet.
- Refunds: cancellations more than 2 hours before booking get full refund, less than 2 hours get 50% refund, no refund for no-shows.
- Scan & Park: scan the host's QR code to start session, pay on exit.
- Confirmation codes are 6-character uppercase alphanumeric.
- Support email: support@slotiq.in | Phone: 1800-SLOTIQ (toll free)

Be friendly, concise, and helpful. Use Indian English naturally. Use ₹ for currency. If you cannot resolve an issue, offer to connect them to a human agent via WhatsApp. Never make up information you don't know.`

const MOCK_RESPONSES = {
  default: [
    "Sure! I'm happy to help. Could you tell me more about what you need?",
    "Of course! Let me help you with that.",
  ],
  parking: [
    "To book parking on SlotIQ:\n1. Tap **Home → Parking tab**\n2. Browse listings near you\n3. Tap a listing to see details\n4. Tap **Book Now** and choose your time\n5. Pay and get your confirmation code! 🅿️\n\nYou can also use **Scan & Park** — just scan the host's QR code to start instantly.",
  ],
  sports: [
    "We have 6 sports on SlotIQ — Football ⚽, Cricket 🏏, Badminton 🏸, Basketball 🏀, and Tennis 🎾!\n\nTo book:\n1. Go to **Home → Sports tab**\n2. Filter by sport type\n3. Pick a venue and time slot\n4. Confirm and pay ✅\n\nPrices start from ₹350/hr for badminton. Peak hours (6–10 PM) may be slightly higher.",
  ],
  bookings: [
    "You can view all your bookings under the **Bookings** tab at the bottom nav.\n\nFilter by: All | Upcoming | Active | Done | Cancelled\n\nFor upcoming bookings, you can expand the card to see your confirmation code and navigate to the venue.",
  ],
  host: [
    "Becoming a host is easy! 🏠\n\n1. Go to **Profile**\n2. Tap **Switch to Host Mode**\n3. On the Dashboard, tap **+ Add New Listing**\n4. Choose Parking or Sports venue\n5. Add details, pricing, and amenities\n6. Go Live!\n\nYou'll start receiving bookings and can withdraw earnings anytime. Average hosts earn ₹8,000–₹15,000/month! 💰",
  ],
  refund: [
    "Our refund policy is straightforward:\n\n✅ **Full refund** — Cancel 2+ hours before your booking\n⚠️ **50% refund** — Cancel less than 2 hours before\n❌ **No refund** — No-shows\n\nRefunds are processed within 3–5 business days to your original payment method.\n\nNeed to cancel a booking? Go to **Bookings → tap your booking → Cancel**.",
  ],
  scan: [
    "Scan & Park is our instant parking feature! 📱\n\n1. Tap **INSTANT** on the Home screen\n2. Point your camera at the host's QR code\n3. Select your vehicle\n4. Tap **Start Parking Session**\n5. A live timer starts — you can see your cost updating in real time\n6. When done, tap **End Session & Pay**\n\nNo need to book in advance! Perfect for spontaneous parking needs.",
  ],
  payment: [
    "We accept multiple payment methods:\n\n💳 **UPI** — Google Pay, PhonePe, Paytm\n🏦 **Debit/Credit Card** — All major cards\n👛 **SlotIQ Wallet** — Your in-app wallet balance\n\nYour wallet balance is shown on your Profile page. Platform fee: ₹10. GST (18%) is applied on all transactions.",
  ],
  human: [
    "Connecting you to a human agent... 👨‍💼\n\nOur team is available **9 AM – 9 PM IST**, Monday to Saturday.\n\n📱 WhatsApp: +91 98765 43210\n📧 Email: support@slotiq.in\n📞 Toll-free: 1800-SLOTIQ\n\nExpected wait time: ~5 minutes.",
  ],
};

function getMockResponse(message) {
  const m = message.toLowerCase();
  if (m.includes('park'))            return MOCK_RESPONSES.parking[0];
  if (m.includes('sport') || m.includes('football') || m.includes('cricket') || m.includes('badminton') || m.includes('basketball') || m.includes('tennis')) return MOCK_RESPONSES.sports[0];
  if (m.includes('book'))            return MOCK_RESPONSES.bookings[0];
  if (m.includes('host') || m.includes('list') || m.includes('earn')) return MOCK_RESPONSES.host[0];
  if (m.includes('refund') || m.includes('cancel'))  return MOCK_RESPONSES.refund[0];
  if (m.includes('scan') || m.includes('qr'))        return MOCK_RESPONSES.scan[0];
  if (m.includes('pay') || m.includes('upi') || m.includes('wallet')) return MOCK_RESPONSES.payment[0];
  if (m.includes('human') || m.includes('agent') || m.includes('help')) return MOCK_RESPONSES.human[0];
  return "I'm here to help! You can ask me about:\n- 🅿️ Finding & booking parking\n- 🏟️ Booking sports venues\n- 💰 Host mode & earnings\n- 🔄 Cancellations & refunds\n- 📱 Scan & Park\n- 💳 Payments\n\nWhat would you like to know?";
}

export async function sendToAI(messages, onChunk) {
  if (!CLAUDE_KEY) {
    // Smart mock bot
    const lastMsg = messages[messages.length - 1]?.content || '';
    const reply = getMockResponse(lastMsg);
    // Simulate streaming
    for (let i = 0; i < reply.length; i += 3) {
      await new Promise(r => setTimeout(r, 12));
      onChunk(reply.slice(0, i + 3));
    }
    onChunk(reply);
    return reply;
  }

  // Real Claude API
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        stream: true,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'content_block_delta' && data.delta?.text) {
            fullText += data.delta.text;
            onChunk(fullText);
          }
        } catch {}
      }
    }
    return fullText;
  } catch (e) {
    const reply = getMockResponse(messages[messages.length - 1]?.content || '');
    onChunk(reply);
    return reply;
  }
}
