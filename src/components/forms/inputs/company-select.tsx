import { type Path, type UseFormReturn, type FieldValues } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { getApiRoute } from "~/lib/validations/api-routes";
import { type Company } from "~/server/db/schema";

export default function CompanySelect<TData extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  onOpenChange,
  hasMapItem,
  className
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<TData, any, undefined>,
  name: Path<TData>,
  label?: React.ReactNode,
  placeholder?: string,
  onOpenChange?(open: boolean): void,
  hasMapItem?: boolean,
  className?: string,
}) {
  const { data, error, isLoading } = useSWR<Company[], Error>(
    getApiRoute({
      route: "companies", 
      searchParams: {hasMapItem}
    })
  );

  if (isLoading) return <Skeleton className='rounded-xl border-border shadow-sm h-9 w-full'/>
  if (error) {
    toast.error(error.message)
    return null;
  }
  if (!data) return null

  const dataForField = data.map(item => {
    return {value: item.id, label: item.name}
  })

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("", className)}>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            onOpenChange={onOpenChange}
            {...field}
          >
            <FormControl>
              <SelectTrigger ref={field.ref}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                {dataForField.map((item) => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )

}