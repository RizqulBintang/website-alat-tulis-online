
export function Button({ children, variant='default', size='md', className='', ...props }){
  const base='inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[.98]';
  const sizes={sm:'px-3 py-1.5 text-sm',md:'px-4 py-2 text-sm',lg:'px-5 py-3'};
  const variants={
    default:'bg-slate-900 text-white hover:opacity-90',
    outline:'border border-slate-300 text-slate-900',
    secondary:'bg-slate-100 text-slate-900 border border-slate-300',
    ghost:'text-slate-900'
  };
  return <button className={[base,sizes[size]||sizes.md,variants[variant]||variants.default,className].join(' ')} {...props}>{children}</button>;
}
export function Card({className='',children}){return <div className={"rounded-2xl border border-slate-200 p-4 bg-white "+className}>{children}</div>;}
export function CardHeader({className='',children}){return <div className={"mb-2 "+className}>{children}</div>;}
export function CardTitle({className='',children}){return <div className={"font-semibold "+className}>{children}</div>;}
export function CardContent({className='',children}){return <div className={className}>{children}</div>;}
export function Input({className='',...props}){return <input className={"px-3 py-2 rounded-xl border border-slate-300 w-full "+className} {...props}/>;}
export function Separator(){return <hr className="my-2 border-slate-200"/>;}
export function Dialog({open,onOpenChange,children}){return open?children:null;}
export function DialogContent({className='',children}){return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className={"w-full max-w-lg rounded-2xl bg-white p-4 "+className}>{children}</div></div>;}
export function DialogHeader({children}){return <div className="mb-2">{children}</div>;}
export function DialogTitle({children}){return <div className="text-lg font-bold">{children}</div>;}
export function Sheet({open,onOpenChange,children}){return children;}
export function SheetContent({side='right',className='',children}){return <div className="fixed inset-0 z-40"><div className="absolute inset-0 bg-black/40"></div><div className="absolute top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-xl p-4">{children}</div></div>;}
export function SheetHeader({children}){return <div className="mb-2">{children}</div>;}
export function SheetTitle({children}){return <div className="text-lg font-bold">{children}</div>;}
export function SheetTrigger({children}){return children;}
