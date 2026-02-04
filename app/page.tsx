import { redirect } from 'next/navigation';

export default function Result() {

  // This handles the Form data (user inputed timeblocks and energy level)
  async function handleSubmit(formData: FormData) {
    'use server';
    const timeBlocks = formData.get('Time Blocks') as string;
    const energyLevel = formData.get('Energy Level') as string;



    console.log(timeBlocks, energyLevel);
    redirect(`/result?timeBlocks=${encodeURIComponent(timeBlocks as string)}&energyLevel=${encodeURIComponent(energyLevel as string)}`);
  }

  return (
    
    <div className="min-h-screen w-full bg-fixed bg-cover relative">

      {/* Background */}
      <div className=" bg-[linear-gradient(to_right,#73737320_1px,transparent_1px),linear-gradient(to_bottom,#73737320_1px,transparent_1px)] bg-size-[20px_20px]"/>        
      <div className="absolute -z-10 inset-0 h-full w-full bg-fixed bg-[linear-gradient(to_right,#73737320_1px,transparent_1px),linear-gradient(to_bottom,#73737320_1px,transparent_1px)] bg-size-[20px_20px]" />

      {/* Main */}
      <main className="mx-auto flex-col min-h-screen w-full max-w-3xl items-center justify-between py-10 px-16 sm:items-start">


        <div className="flex flex-col justify-center items-center gap-10 text-center sm:text-left">

          {/* Title */}
          <h6 className="text-6xl text-[#628141] text-shadow-[#254F22] text-shadow-lg font-custom-zendots">AI Daily Planner</h6>

          {/* Form */}
          <form action={handleSubmit} className="flex flex-col justify-center items-center gap-10">

            <textarea name="Time Blocks" defaultValue="gym from 8:30am-10am" className="shadow-lg shadow-[#254F22] tracking-wide text-white text-shadow-sm text-shadow-[#00FF00] font-custom-orbitron border-2 border-transperant border-[#353E43] focus:outline-none w-xl h-80 relative bg-white/1 backdrop-blur-sm rounded-xl p-6 max-w-xl"></textarea>

            <div className="flex flex-col bg-red gap-5">              
            
              <div className="inline-flex gap-10 justify-center items-center">

                <h1 className="font-custom-zendots font-semibold text-[#628141] text-heading">Select Energy Level:</h1>

                <select className="font-custom-zendots text-[#254F22] focus:outline-none" name="Energy Level" id="select">
                  
                  <option className="text-black font-custom-zendots" value="High">High</option>
                  <option className="text-black font-custom-zendots bg-transparent" value="Medium">Medium</option>
                  <option className="text-black font-custom-zendots" value="Low">Low</option>
                
                </select>
              </div>
            </div>

            <button type="submit" className="font-custom-zendots relative p-0.5 inline-flex items-center justify-center font-bold overflow-hidden group rounded-md">
              <span className="w-full h-full bg-linear-to-br from-[#628141] via-[#8BAE66] to-[#1B211A] group-hover:from-[#1B211A] group-hover:via-[#8BAE66] group-hover:to-[#628141] absolute"></span>
                <span className="relative px-6 py-3 transition-all ease-out bg-white/10 backdrop-blur-sm rounded-md group-hover:bg-opacity-0 duration-400">
                <span className="relative text-[#222222]">Create Schedule</span>
              </span>
            </button>

          </form>
        </div>

      </main>

    </div>
  );
}
