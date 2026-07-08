"use client";
import { useMemo } from "react";
import { Box, Button, Text, DatePicker, Portal } from "@chakra-ui/react";
import { parseDate, today, getLocalTimeZone } from "@internationalized/date";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import { formatDate } from "@/src/utils/dateUtils";
import FilterControlButton from "@/src/components/ui/FilterControlButton";

interface PublicationDateFilterProps {
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
}

const PublicationDateFilter = ({ selectedDate, onDateChange }: PublicationDateFilterProps) => {
  const maxDate = useMemo(() => today(getLocalTimeZone()), []);

  return (
    <Box position="relative" w="25%">
      <DatePicker.Root
        w="full"
        max={maxDate}
        value={selectedDate ? [parseDate(selectedDate)] : []}
        onValueChange={(details) => {
          onDateChange(details.value[0]?.toString() ?? null);
        }}
        positioning={{ placement: "bottom-start" }}
      >
        <DatePicker.Control w="full">
          <DatePicker.Trigger asChild>
            <FilterControlButton
              variant="outline"
              colorPalette="gray"
              w="full"
              justifyContent="space-between"
              color="fg"
            >
              <Text truncate color="fg">
                {selectedDate ? formatDate(selectedDate) : "Date"}
              </Text>
              <MdKeyboardDoubleArrowDown />
            </FilterControlButton>
          </DatePicker.Trigger>
        </DatePicker.Control>
        <Portal>
          <DatePicker.Positioner>
            <DatePicker.Content
              bg="bg"
              borderWidth="1px"
              borderRadius="md"
              borderColor="gray.400"
              _dark={{ borderColor: "whiteAlpha.400" }}
            >
              <DatePicker.View view="day">
                <DatePicker.Header />
                <DatePicker.DayTable />
              </DatePicker.View>
              <DatePicker.View view="month">
                <DatePicker.Header />
                <DatePicker.MonthTable />
              </DatePicker.View>
              <DatePicker.View view="year">
                <DatePicker.Header />
                <DatePicker.YearTable />
              </DatePicker.View>
              {selectedDate && (
                <Box display="flex" justifyContent="flex-end" px={2} pb={2}>
                  <DatePicker.ClearTrigger asChild>
                    <Button size="xs" variant="ghost">
                      Clear
                    </Button>
                  </DatePicker.ClearTrigger>
                </Box>
              )}
            </DatePicker.Content>
          </DatePicker.Positioner>
        </Portal>
      </DatePicker.Root>
    </Box>
  );
};

export default PublicationDateFilter;
