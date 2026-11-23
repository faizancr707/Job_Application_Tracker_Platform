import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";
import { motion } from "framer-motion";

const UpdateProfileDialog = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);

  const [input, setInput] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.profile?.bio || "",
    skills: user?.profile?.skills?.join(", ") || "",
    file: user?.profile?.resume || "",
  });

  const [fileError, setFileError] = useState("");
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type !== "application/pdf") {
      setFileError("Only PDF files are allowed (.pdf)");
    } else {
      setFileError("");
    }
    setInput({ ...input, file });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (fileError) {
      toast.error(fileError);
      return;
    }
    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("bio", input.bio);
    formData.append(
      "skills",
      input.skills.split(",").map((skill) => skill.trim())
    );
    if (input.file) {
      formData.append("file", input.file);
    }
    try {
      setLoading(true);
      axios.defaults.withCredentials = true;
      const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
    setOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto bg-neu-base border border-white/30 rounded-neu-lg shadow-neu-raised-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-charcoal">Update Profile</DialogTitle>
            <DialogDescription className="text-charcoal-muted text-sm">
              Update your account details and profile information here. Click submit when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitHandler} className="flex flex-col gap-3.5 mt-2">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-charcoal">Name</Label>
              <Input
                id="name"
                name="fullname"
                type="text"
                value={input.fullname}
                onChange={changeEventHandler}
                className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-charcoal">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={input.email}
                onChange={changeEventHandler}
                className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10"
              />
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="number" className="text-xs font-bold uppercase tracking-wider text-charcoal">Phone Number</Label>
              <Input
                id="number"
                name="phoneNumber"
                value={input.phoneNumber}
                onChange={changeEventHandler}
                className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10"
              />
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-charcoal">Bio</Label>
              <Input
                id="bio"
                name="bio"
                value={input.bio}
                onChange={changeEventHandler}
                className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10"
              />
            </div>

            {/* Skills */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="skills" className="text-xs font-bold uppercase tracking-wider text-charcoal">Skills (comma separated)</Label>
              <Input
                id="skills"
                name="skills"
                value={input.skills}
                onChange={changeEventHandler}
                className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10"
              />
            </div>

            {/* File input for resume */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="file" className="text-xs font-bold uppercase tracking-wider text-charcoal">Resume (PDF)</Label>
              <Input
                id="file"
                name="file"
                type="file"
                accept="application/pdf"
                onChange={fileChangeHandler}
                className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10 cursor-pointer text-sm"
              />
            </div>

            {fileError && <div className="text-terracotta text-xs font-semibold">{fileError}</div>}

            <DialogFooter className="mt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-burnt-orange-dim to-burnt-orange hover:from-burnt-orange hover:to-burnt-orange-hover text-white font-bold shadow-neu-btn hover:shadow-glow-orange"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Submit Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default UpdateProfileDialog;
