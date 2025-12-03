import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateFilterProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onFilter: () => void;
}

export const DateFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onFilter
}: DateFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-end">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 font-medium">Data Inicial</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[160px] justify-start text-left font-normal bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white",
                !startDate && "text-gray-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-white/20" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChange}
              initialFocus
              locale={ptBR}
              className="pointer-events-auto bg-[#1a1a1a] text-white"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-400 font-medium">Data Final</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[160px] justify-start text-left font-normal bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white",
                !endDate && "text-gray-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-white/20" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={onEndDateChange}
              initialFocus
              locale={ptBR}
              className="pointer-events-auto bg-[#1a1a1a] text-white"
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button 
        onClick={onFilter}
        className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e3a8a] hover:to-[#2563eb] text-white shadow-lg shadow-blue-500/25"
      >
        <Search className="h-4 w-4 mr-2" />
        Filtrar
      </Button>
    </div>
  );
};
