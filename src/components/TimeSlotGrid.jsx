import Card from './Card';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TimeSlotGrid = ({ availability, onChange, onAddSlot, onRemoveSlot }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {days.map((day) => {
      const rawSlots = availability[day] || [];
      const slots = Array.isArray(rawSlots) && Array.isArray(rawSlots[0]) 
        ? rawSlots 
        : Array.isArray(rawSlots) && typeof rawSlots[0] === 'string'
          ? [rawSlots]
          : [];

      return (
        <Card key={day} className="bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{day}</h3>
            <button
              onClick={() => onAddSlot(day)}
              className="text-sm rounded hover:bg-sky/20 px-2 py-1 text-sky-800 font-medium"
            >
              + Slot
            </button>
          </div>
          <div className="space-y-2">
            {slots.map((slot, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  className="rounded-lg border border-sky px-2 py-2 w-full text-sm"
                  type="time"
                  value={slot[0] || ''}
                  onChange={(e) => onChange(day, index, 0, e.target.value)}
                />
                <span className="text-gray-500 text-sm">-</span>
                <input
                  className="rounded-lg border border-sky px-2 py-2 w-full text-sm"
                  type="time"
                  value={slot[1] || ''}
                  onChange={(e) => onChange(day, index, 1, e.target.value)}
                />
                <button
                  onClick={() => onRemoveSlot(day, index)}
                  className="text-red-500 hover:text-red-700 font-bold px-1"
                  title="Remove slot"
                >
                  ✕
                </button>
              </div>
            ))}
            {slots.length === 0 && (
              <p className="text-sm text-gray-500 italic py-2">No availability set</p>
            )}
          </div>
        </Card>
      );
    })}
  </div>
);

export default TimeSlotGrid;
