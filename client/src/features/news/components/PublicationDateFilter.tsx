"use client";
import { useMemo } from "react";
import { Box, Button, Icon, Text, DatePicker, Portal } from "@chakra-ui/react";
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
    <Box position="relative" w={{ base: "full", md: "auto" }} flex={{ md: "1" }} minW={{ md: 0 }}>
      <DatePicker.Root
        w="full"
        max={maxDate}
        value={selectedDate ? [parseDate(selectedDate)] : []}
        onValueChange={(details) => {
          onDateChange(details.value[0]?.toString() ?? null);
        }}
        positioning={{ placement: "bottom-start" }}
      >
        <DatePicker.Control
          w="full"
          display="flex"
          borderWidth="0"
          p={0}
          m={0}
          minH="8"
          bg="transparent"
          shadow="none"
        >
          <DatePicker.Trigger asChild>
            <FilterControlButton
              w="full"
              h="8"
              justifyContent="space-between"
              color="fg"
            >
              <Text truncate color="fg">
                {selectedDate ? formatDate(selectedDate) : "Date"}
              </Text>
              <Icon boxSize="5">
                <MdKeyboardDoubleArrowDown />
              </Icon>
            </FilterControlButton>
          </DatePicker.Trigger>
        </DatePicker.Control>
        <Portal>
          <DatePicker.Positioner>
            <DatePicker.Content
              zIndex={50}
              bg="bg"
              borderWidth="1px"
              borderRadius="md"
              borderColor="border.control"
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
