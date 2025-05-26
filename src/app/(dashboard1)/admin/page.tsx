import Annoucement from "@/components/Annoucement"
import AttendanceChartContainer from "@/components/AttendanceChartContainer"
import CountChartContainer from "@/components/CountChartContainer"
import EventCalendarContainer from "@/components/EventCalendarContainer"
import FinanceChart from "@/components/FinanceChart"
import UserCard from "@/components/UserCard"

const AdminPage = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  return (
    <div className='p-4 flex flex-col gap-4 md:flex-row'>
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex-col gap-8">
        {/* UserCard */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="admin" />
          <UserCard type="teacher" />
          <UserCard type="student" />
          <UserCard type="parent" />
        </div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row mt-5">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChartContainer />
          </div>
          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChartContainer />
          </div>
        </div>
        {/*BOTTOM CHART */}
        <div className="w-full h-[660px] mt-5">
          <FinanceChart />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <EventCalendarContainer searchParams={searchParams} />
        <Annoucement />
      </div>
    </div>
  )
}

export default AdminPage