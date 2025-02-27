"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, Plus } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import EventForm from "@/components/events/EventForm";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import SearchAndFilter from "@/components/layout/SearchAndFilter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Event {
  _id: string;
  type: "hackathon" | "workshop" | "conference" | "meetup" | "webinar";
  date: string;
  title: string;
  tags: string[];
  description: string;
  time: string;
  location: string;
  mode: "online" | "in-person" | "hybrid";
  image: string;
  organizer: {
    _id: string;
    name: string;
  };
  createdAt: string;
  website?: string;
  registrations: number;
  registrationUrl?: string;
  rewards?: string;
}

export default function EventsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const filterOptions = [
    { label: "All Events", value: "all" },
    { label: "Hackathons", value: "hackathon" },
    { label: "Workshops", value: "workshop" },
    { label: "Conferences", value: "conference" },
    { label: "Meetups", value: "meetup" },
    { label: "Webinars", value: "webinar" },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(tokenData.role === 'admin');
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filterValue !== "all") {
        queryParams.append("type", filterValue);
      }
      if (searchValue) {
        queryParams.append("search", searchValue);
      }

      const response = await fetch(`${API_BASE_URL}/api/events?${queryParams}`);
      const data = await response.json();
      if (data.success) {
        setEvents(data.data.events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filterValue, searchValue, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSubmitEvent = async (formData: {
    type: "hackathon" | "workshop" | "conference" | "meetup" | "webinar";
    date: string;
    title: string;
    tags: string[];
    description: string;
    time: string;
    location: string;
    mode: "online" | "in-person" | "hybrid";
    image?: string;
    website?: string;
    registrationUrl?: string;
    rewards?: string;
  }) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create events",
          variant: "destructive",
        });
        router.push('/login');
        return;
      }

      // Ensure image is a string
      const eventData = {
        ...formData,
        image: formData.image || '/placeholder-event.jpg' // Provide a default image if none is provided
      };

      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Event created successfully",
        });
        setShowAddForm(false);
        fetchEvents(); // Refresh the events list
      } else {
        throw new Error(data.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/export/excel`, {
        headers: {
          Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export events");
      }

      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "events-export.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting events:", error);
      toast({
        title: "Error",
        description: "Failed to export events",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to delete the event');
      }

      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete event');
      }

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Tech Events"
        description="Discover and participate in exciting tech events"
        action={
          isAdmin && (
            <Button 
              className="gap-2" 
              onClick={() => setShowAddForm(true)}
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          )
        }
      />

      {showAddForm && (
        <EventForm 
          onSubmit={handleSubmitEvent} 
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <SearchAndFilter
        value={searchValue}
        onChange={setSearchValue}
        filter={filterValue}
        onFilterChange={setFilterValue}
        filterOptions={filterOptions}
      />

      <div className="flex justify-end mt-4">
        <Button variant="outline" className="gap-2" onClick={handleExportExcel}>
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {isLoading ? (
          // Loading skeletons
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-card animate-pulse rounded-lg p-4 h-64" />
          ))
        ) : events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event._id}
              event={{
                id: event._id,
                title: event.title,
                description: event.description,
                date: new Date(event.date).toLocaleDateString(),
                time: event.time,
                location: event.location,
                attendees: event.registrations,
                price: event.registrationUrl ? "Paid" : "Free",
                rewards: event.rewards || "",
                image: event.image || "/placeholder-event.jpg",
                tags: event.tags,
                mode: event.mode as "online" | "in-person" | "hybrid",
                organizer: event.organizer
              }}
              onDelete={() => handleDeleteEvent(event._id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No events found
          </div>
        )}
      </div>
    </PageContainer>
  );
} 