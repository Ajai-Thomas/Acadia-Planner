import PageShell from '../components/PageShell';
import TimeSlotGrid from '../components/TimeSlotGrid';
import { usePlanner } from '../context/PlannerContext';

const AvailabilityPage = () => {
  const { availability, setAvailability, notify } = usePlanner();

  const handleChange = (day, slotIndex, timeIndex, value) => {
    setAvailability((prev) => {
      const daySlots = [...(prev[day] || [])];
      // ensure backward-compatibility if current state is a 1D array
      const is1D = daySlots.length > 0 && typeof daySlots[0] === 'string';
      const slotsArray = is1D ? [daySlots] : daySlots;
      
      const newSlots = [...slotsArray];
      if (!newSlots[slotIndex]) {
         newSlots[slotIndex] = ['', ''];
      } else {
         newSlots[slotIndex] = [...newSlots[slotIndex]];
      }
      newSlots[slotIndex][timeIndex] = value;
      return { ...prev, [day]: newSlots };
    });
  };

  const handleAddSlot = (day) => {
    setAvailability((prev) => {
      const daySlots = [...(prev[day] || [])];
      const is1D = daySlots.length > 0 && typeof daySlots[0] === 'string';
      const newSlots = is1D ? [daySlots] : daySlots;
      newSlots.push(['', '']);
      return { ...prev, [day]: newSlots };
    });
    notify('Slot added');
  };

  const handleRemoveSlot = (day, slotIndex) => {
    setAvailability((prev) => {
      const daySlots = [...(prev[day] || [])];
      const is1D = daySlots.length > 0 && typeof daySlots[0] === 'string';
      const newSlots = is1D ? [daySlots] : daySlots;
      newSlots.splice(slotIndex, 1);
      return { ...prev, [day]: newSlots };
    });
    notify('Slot removed');
  };

  return (
    <PageShell title="Weekly Availability Scheduler">
      <TimeSlotGrid
        availability={availability}
        onChange={handleChange}
        onAddSlot={handleAddSlot}
        onRemoveSlot={handleRemoveSlot}
      />
    </PageShell>
  );
};

export default AvailabilityPage;
