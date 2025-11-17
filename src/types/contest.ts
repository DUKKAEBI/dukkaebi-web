export interface Contest {
  id: number;
  title: string;
  organizer: string;
  category: string;
  startDate: string;
  endDate: string;
  dDay: number;
  prize: string;
  status: "ongoing" | "upcoming" | "ended";
  imageUrl: string;
  tags: string[];
}
