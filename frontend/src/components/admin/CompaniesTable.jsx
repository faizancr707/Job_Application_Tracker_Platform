import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Edit2, MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CompaniesTable = () => {
  const { companies, searchCompanyByText } = useSelector((store) => store.company);
  const [filterCompany, setFilterCompany] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const filteredCompany = companies
      ?.filter((company) => company && company.id)
      ?.filter((company) => {
        if (!searchCompanyByText) return true;
        return company.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());
      });

    setFilterCompany(filteredCompany || []);
  }, [companies, searchCompanyByText]);

  return (
    <div className="bg-neu-base border border-white/25 rounded-neu-lg shadow-neu-raised overflow-x-auto">
      <Table className="min-w-full">
        <TableCaption className="py-4 text-xs text-charcoal-dim">
          A list of your registered company workspaces
        </TableCaption>
        <TableHeader>
          <TableRow className="bg-neu-base-dark/60 hover:bg-neu-base-dark/60 border-b border-white/20">
            <TableHead className="py-4 px-6 text-charcoal font-bold text-xs uppercase tracking-wider">Logo</TableHead>
            <TableHead className="py-4 px-6 text-charcoal font-bold text-xs uppercase tracking-wider">Company Name</TableHead>
            <TableHead className="py-4 px-6 text-charcoal font-bold text-xs uppercase tracking-wider">Registered Date</TableHead>
            <TableHead className="py-4 px-6 text-right text-charcoal font-bold text-xs uppercase tracking-wider">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filterCompany.length > 0 ? (
            filterCompany.map((company) => (
              <TableRow key={company.id} className="hover:bg-neu-base-dark/40 border-b border-white/15 last:border-b-0 transition-colors">
                <TableCell className="py-4 px-6">
                  <Avatar className="w-10 h-10 rounded-xl shadow-neu-flat border border-white/30">
                    <AvatarImage src={company.logo} alt={company.name} />
                  </Avatar>
                </TableCell>
                <TableCell className="py-4 px-6 font-bold text-charcoal">
                  {company.name}
                </TableCell>
                <TableCell className="py-4 px-6 text-sm text-charcoal-muted">
                  {company.createdAt?.split("T")[0] || 'N/A'}
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="p-2 rounded-xl bg-neu-base shadow-neu-flat hover:shadow-neu-raised-xs text-charcoal-muted hover:text-burnt-orange border border-white/20 transition">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-36 bg-neu-base border border-white/25 shadow-neu-raised-md rounded-neu p-1.5">
                      <div
                        onClick={() => navigate(`/admin/companies/${company.id}`)}
                        className="flex items-center gap-2 cursor-pointer text-charcoal hover:text-burnt-orange hover:bg-neu-base-dark p-2 rounded-lg text-sm font-semibold transition"
                      >
                        <Edit2 className="w-4 h-4 text-burnt-orange" />
                        <span>Edit Setup</span>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10 text-charcoal-dim text-sm">
                No companies registered yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompaniesTable;
