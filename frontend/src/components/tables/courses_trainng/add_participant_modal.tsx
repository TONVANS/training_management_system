// src/components/tables/courses_trainng/add_participant_modal.tsx
"use client";
import { useState } from "react";
import { Plus, Loader2, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import api from "@/util/axios";
import { toast } from "sonner";

interface AddParticipantModalProps {
  courseId: number;
  onParticipantAdded: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface EmployeeCandidate {
  id: number;
  employee_code: string;
  first_name_la: string;
  last_name_la: string;
  status?: "found" | "error" | "pending";
  errorMessage?: string;
  email?: string;
}

export function AddParticipantModal({
  courseId,
  onParticipantAdded,
  isOpen,
  onClose,
}: AddParticipantModalProps) {
  const [employeeCodeSearch, setEmployeeCodeSearch] = useState("");
  const [foundEmployee, setFoundEmployee] = useState<{ id: number; employee_code: string; first_name_la: string; last_name_la: string; email?: string } | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearchEmployee = async (code: string) => {
    setEmployeeCodeSearch(code);
    setSearchError(null);
    if (!code.trim()) {
      setFoundEmployee(null);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(`/employees/code/${code.trim()}`);
      const employee = response.data.data || response.data;
      if (employee) {
        setFoundEmployee(employee);
      }
    } catch (error: unknown) {
      setFoundEmployee(null);
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      // Only show error explicitly if it's 404
      if (axiosError?.response?.status === 404) {
         setSearchError("ບໍ່ພົບຂໍ້ມູນພະນັກງານລະຫັດນີ້");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddParticipant = () => {
    if (!foundEmployee) return;

    if (selectedEmployees.some((e) => e.id === foundEmployee.id)) {
      toast.error("ພະນັກງານນີ້ຖືກເພີ່ມເຂົ້າໃນລາຍການແລ້ວ");
      return;
    }

    const newEmployee: EmployeeCandidate = {
      id: foundEmployee.id,
      employee_code: foundEmployee.employee_code,
      first_name_la: foundEmployee.first_name_la,
      last_name_la: foundEmployee.last_name_la,
      email: foundEmployee.email,
      status: "found",
    };

    setSelectedEmployees([...selectedEmployees, newEmployee]);
    setEmployeeCodeSearch("");
    setFoundEmployee(null);
  };

  const removeEmployee = (employeeId: number) => {
    setSelectedEmployees(selectedEmployees.filter((e) => e.id !== employeeId));
  };

  const handleSubmit = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please add at least one employee");
      return;
    }

    setIsSubmitting(true);

    try {
      // Enroll each employee
      const enrollmentPromises = selectedEmployees.map((employee) =>
        api.post("/enrollments", {
          employee_id: employee.id,
          course_id: courseId,
        })
      );

      await Promise.all(enrollmentPromises);

      toast.success(
        `Successfully enrolled ${selectedEmployees.length} employee(s)`
      );

      // Reset and close
      setSelectedEmployees([]);
      setEmployeeCodeSearch("");
      setSearchError(null);
      onParticipantAdded();
      onClose();
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string }, status?: number };
      };
      const errorMsg =
        axiosError?.response?.data?.message || "Failed to enroll employees";

      // Check if it's a conflict error (already enrolled)
      if (
        errorMsg.includes("already enrolled") ||
        axiosError?.response?.status === 409
      ) {
        toast.error("ມີພະນັກງານບາງຄົນລົງທະບຽນໃນຫຼັກສູດນີ້ແລ້ວ");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddParticipant();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Add Participants to Training
          </DialogTitle>
          <DialogDescription>
            Search and add employees to this training course
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search Section */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-3 items-end">
              <div className="grid gap-2">
                <label className="text-xs font-medium text-gray-600">
                  ລະຫັດພະນັກງານ
                </label>
                <div className="relative">
                  <Input
                    placeholder="EMP001..."
                    value={employeeCodeSearch}
                    onChange={(e) => handleSearchEmployee(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSearching || isSubmitting}
                    className="h-10 bg-white"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-medium text-gray-600">
                  ຊື່-ນາມສະກຸນ
                </label>
                <Input
                  readOnly
                  value={foundEmployee ? `${foundEmployee.first_name_la} ${foundEmployee.last_name_la}` : ""}
                  placeholder="ລະບົບຈະສະແດງຊື່..."
                  className="bg-white h-10 text-gray-700"
                />
              </div>

              <Button
                type="button"
                onClick={handleAddParticipant}
                disabled={!foundEmployee || isSubmitting}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700"
              >
                ເພີ່ມ
              </Button>
            </div>

            {/* Error Message */}
            {searchError && (
              <div className="flex items-start gap-2 p-2 mt-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </div>

          {/* Selected Employees List */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Selected Employees ({selectedEmployees.length})
            </label>

            {selectedEmployees.length === 0 ? (
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500 text-sm">
                No employees selected yet. Add employees using the search above.
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {selectedEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-200 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50">
                          {employee.employee_code}
                        </Badge>
                        <span className="font-medium text-sm text-gray-900 truncate">
                          {employee.first_name_la} {employee.last_name_la}
                        </span>
                      </div>
                      {employee.email && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {employee.email}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmployee(employee.id)}
                      disabled={isSubmitting}
                      className="ml-2 shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Message */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Search for each employee by their code and add them to the list
              before submitting.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 px-6"
          >
            ຍົກເລີກ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedEmployees.length === 0}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ກຳລັງບັນທຶກ...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                ບັນທຶກເຂົ້າຮ່ວມ ({selectedEmployees.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
